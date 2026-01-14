from minio import Minio
from minio.error import S3Error
import os
from dotenv import load_dotenv

load_dotenv()

MINIO_URL = os.getenv("MINIO_URL", "localhost:9000")
ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "avatars")
SECURE = os.getenv("MINIO_SECURE", "False").lower() == "true"

client = Minio(
    MINIO_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    secure=SECURE
)

def init_bucket():
    """Crea el bucket si no existe y lo hace público (read-only)"""
    try:
        if not client.bucket_exists(BUCKET_NAME):
            client.make_bucket(BUCKET_NAME)
            # Política pública para leer imágenes
            policy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}' % BUCKET_NAME
            client.set_bucket_policy(BUCKET_NAME, policy)
            print(f"Bucket '{BUCKET_NAME}' creado exitosamente.")
    except S3Error as e:
        print(f"Error MinIO: {e}")

def upload_file(file_data, filename, content_type):
    try:
        client.put_object(
            BUCKET_NAME,
            filename,
            file_data,
            length=-1,
            part_size=10*1024*1024,
            content_type=content_type
        )
        # Retornar URL accesible
        return f"http://localhost:9000/{BUCKET_NAME}/{filename}"
    except S3Error as e:
        print(f"Error subiendo archivo: {e}")
        return None