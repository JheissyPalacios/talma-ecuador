import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import storage
import uuid
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "talma-credenciales.json"

# Inicializar la aplicación Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def actualizar_documento(id_documento, nuevos_datos):
    try:
        # Obtener una referencia al documento
        referencia_documento = db.collection("solicitudes").document(id_documento)

        # Actualizar el documento con los nuevos datos
        referencia_documento.update(nuevos_datos)

        print('Documento actualizado correctamente:', nuevos_datos)
    except Exception as e:
        print('Error al actualizar el documento:', e)

def view_documento(id_documento):
    referencia_documento = db.collection("solicitudes").document(id_documento)
    documento = referencia_documento.get()
    # Recupera los datos del documento
    datos = documento.to_dict()

    return datos



def upload_file(file_path, content_type):
    try:
        # Configurar el cliente de almacenamiento de Firebase
        storage_client = storage.Client()

        # Generar un nuevo UUID para el nombre del objeto
        nuevo_uuid = str(uuid.uuid4())

        # Configurar metadatos
        metadata = {"contentType": content_type}

        # Obtener el bucket de Firebase
        bucket = storage_client.bucket("talma-a8629.appspot.com")  # Reemplaza con el nombre de tu bucket

        # Crear un objeto Blob en el bucket
        blob = bucket.blob(nuevo_uuid)

        # Cargar el archivo al objeto Blob con metadatos
        blob.upload_from_filename(file_path, content_type=content_type)

        # Obtener la URL de descarga del archivo recién cargado
        blob.make_public()
        url = blob.public_url


        print(f"Archivo cargado exitosamente. URL: {url}")
        return url
    except Exception as e:
        print('errorrrrr', e)