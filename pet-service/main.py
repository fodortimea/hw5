from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from models import Pet, PetCreate, PetUpdate, PetResponse, get_db, Base, engine
import uvicorn
import time
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables with retry logic
def create_tables_with_retry(max_retries=30, retry_delay=10):
    import os
    logger.info(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')}")
    logger.info("Starting pet service with improved database connection handling")
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to create database tables (attempt {attempt + 1}/{max_retries})")
            # Test connection first
            from sqlalchemy import text
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                logger.info("Database connection test successful")
            
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
            return
        except Exception as e:
            logger.warning(f"Failed to create tables on attempt {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                logger.error("All attempts to create tables failed")
                raise

# Initialize database
create_tables_with_retry()

app = FastAPI(
    title="Pet Store - Pet Service",
    description="Microservice for managing pets in the pet store",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "http://localhost:3000", "*"],
    allow_credentials=False,  # Set to False when using wildcard origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

@app.get("/")
def root():
    return {"message": "Pet Service is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "pet-service"}

@app.options("/petstore/pets")
async def pets_options():
    return {"message": "CORS preflight for pets"}

@app.options("/petstore/pets/{pet_id}")
async def pet_options(pet_id: int):
    return {"message": "CORS preflight for pet"}

@app.options("/")
async def root_options():
    return {"message": "CORS preflight for root"}

@app.post("/petstore/pets", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    db_pet = Pet(**pet.dict())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.get("/petstore/pets", response_model=List[PetResponse])
def get_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    pets = db.query(Pet).offset(skip).limit(limit).all()
    return pets

@app.get("/petstore/pets/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@app.put("/petstore/pets/{pet_id}", response_model=PetResponse)
def update_pet(pet_id: int, pet_update: PetUpdate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    update_data = pet_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)
    
    db.commit()
    db.refresh(pet)
    return pet

@app.delete("/petstore/pets/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    db.delete(pet)
    db.commit()
    return {"message": f"Pet {pet_id} deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)