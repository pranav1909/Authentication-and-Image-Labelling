from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from flask_cors import CORS
import os
from bson import ObjectId

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret'

# Connect to MongoDB
client = MongoClient('mongodb+srv://dbadmin:dbadmin@originmed.fmqguuz.mongodb.net/?retryWrites=true&w=majority')
db = client['db']
users_collection = db['users']
labels_collection = db['labels']

# User registration endpoint
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    # Check if email, password, and adminId are provided
    if 'email' not in data or 'password' not in data or 'adminId' not in data:
        return jsonify({'error': 'email, password, and adminId are required'}), 400

    # Check if the adminId is equal to '0000' to determine admin status
    is_admin = data['adminId'] == '0000'

    # Check if the email already exists
    existing_user = users_collection.find_one({'email': data['email']})
    if existing_user:
        return jsonify({'error': 'Email already exists'}), 400

    # Hash the password
    hashed_password = generate_password_hash(data['password'], method='sha256')

    if not is_admin:
        return jsonify({'error': 'Admin id did not match'}), 400

    # Save the new user to the database with admin status
    user_data = {
        'email': data['email'],
        'password': hashed_password,
        'isAdmin': is_admin
    }
    users_collection.insert_one(user_data)

    response_data = {
        'email': user_data['email'],
        'isAdmin': is_admin
    }

    return jsonify(response_data), 201

# User login endpoint
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    # Check if email and password are provided
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and Password are required'}), 400

    # Check if the email exists
    user = users_collection.find_one({'email': data['email']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    response_data = {
        'email': user['email'],
        'isAdmin': user['isAdmin']
    }

    return jsonify(response_data), 200

# Google Login endpoint
@app.route('/auth/googlelogin', methods=['POST'])
def googleLogin():
    data = request.get_json()

    # Check if email and password are provided
    if 'email' not in data:
        return jsonify({'error': 'email required'}), 400

    # Check if the email exists
    user = users_collection.find_one({'email': data['email']})

    response_data = {
        'email': user['email'],
        'isAdmin': user['isAdmin']
    }

    return jsonify(response_data), 200


@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            raise ValueError("No image provided")

        image = request.files['image']
        
        if image.filename == '':
            raise ValueError("No selected file")

        image.save('D:/Origin Medical assignment/images/' + image.filename)

        return jsonify({"message": "Image uploaded successfully"})
    except Exception as e:
        error_message = str(e)
        print(f"Error uploading image: {error_message}")
        return jsonify({"error": error_message}), 400

@app.route('/images', methods=['GET'])
def get_images():
    try:
        image_folder = 'D:/Origin Medical assignment/images/'

        if not os.path.exists(image_folder):
            raise FileNotFoundError("Image folder not found")

        images = [filename for filename in os.listdir(image_folder) if filename.endswith(('.jpg', '.jpeg', '.png'))]

        return jsonify({"images": images})
    except Exception as e:
        error_message = str(e)
        print(f"Error fetching images: {error_message}")
        return jsonify({"error": error_message}), 500

@app.route('/images/<path:image_filename>', methods=['GET'])
def get_image(image_filename):
    try:
        image_folder = 'D:/Origin Medical assignment/images/'

        if not os.path.exists(image_folder):
            raise FileNotFoundError("Image folder not found")

        return send_from_directory(image_folder, image_filename)
    except Exception as e:
        error_message = str(e)
        print(f"Error fetching image: {error_message}")
        return jsonify({"error": error_message}), 500
    
@app.route('/images/delete', methods=['POST'])
def delete_images():
    try:
        data = request.get_json()
        image_filenames = data.get('filenames')

        if not image_filenames:
            return jsonify({'error': 'Image filenames are required'}), 400

        image_folder = 'D:/Origin Medical assignment/images/'

        for filename in image_filenames:
            image_path = os.path.join(image_folder, filename)

            if os.path.exists(image_path):
                os.remove(image_path)
            else:
                return jsonify({'error': f'Image {filename} not found'}), 404

        return jsonify({'message': 'Images deleted successfully'})
    except Exception as e:
        error_message = str(e)
        print(f"Error deleting images: {error_message}")
        return jsonify({"error": error_message}), 500
    



# handle labels
def serialize_label(label):
    """Serialize ObjectId to string for JSON serialization."""
    label['_id'] = str(label['_id'])
    return label    

@app.route('/api/labels', methods=['GET', 'POST', 'DELETE'])
def manage_labels():
    if request.method == 'GET':
        labels = list(labels_collection.find())
        serialized_labels = [serialize_label(label) for label in labels]
        return jsonify({'labels': serialized_labels})

    if request.method == 'POST':
        data = request.get_json()
        label_text = data.get('text')

        if label_text:
            label = {'text': label_text}
            labels_collection.insert_one(label)
            return jsonify({'message': 'Label added successfully'})
        else:
            return jsonify({'error': 'Text field is required'}), 400

    if request.method == 'DELETE':
        data = request.get_json()
        label_ids = data.get('ids')

        if label_ids:
            # Convert label_ids to ObjectId for deletion
            label_ids = [ObjectId(label_id) for label_id in label_ids]
            labels_collection.delete_many({'_id': {'$in': label_ids}})
            return jsonify({'message': 'Labels deleted successfully'})
        else:
            return jsonify({'error': 'Label IDs are required'}), 400
        

@app.route('/api/associateLabel', methods=['POST'])
def associate_label():
    try:
        data = request.get_json()
        user_email = data.get('userEmail')
        image_filename = data.get('image')
        labels = data.get('labels', [])  # Assuming labels is a list of strings

        # Check if the user exists
        user = users_collection.find_one({'email': user_email})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Check if the image exists
        image_folder = 'D:/Origin Medical assignment/images/'
        image_path = os.path.join(image_folder, image_filename)
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404

        # Check if the labels exist
        existing_labels = labels_collection.find({'text': {'$in': labels}})
        missing_labels = set(labels) - {label['text'] for label in existing_labels}
        if missing_labels:
            return jsonify({'error': f'Labels not found: {", ".join(missing_labels)}'}), 404

        # Associate labels with the image in the user's document
        users_collection.update_one(
            {'email': user_email},
            {'$addToSet': {'images': {'filename': image_filename, 'labels': labels}}}
        )

        return jsonify({'message': 'Labels associated with image successfully'})
    except Exception as e:
        error_message = str(e)
        print(f"Error associating labels with image: {error_message}")
        return jsonify({"error": error_message}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
