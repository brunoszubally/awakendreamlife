from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
import os


app = Flask(__name__)
CORS(app)

api_key = os.environ.get('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process-dreams', methods=['POST'])
def process_dreams():
    data = request.json
    dream_text = data.get('text', '')
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """Te egy kreatív író vagy, aki inspiráló és részletes történeteket ír. 
                A feladatod az, hogy a felhasználó álmait és céljait egy élénk, első személyű történetté alakítsd át,
                ami egy napot mutat be a jövőbeli életükből, amikor már elérték ezeket a célokat."""},
                {"role": "user", "content": f"""
                A következő céljaim és álmaim vannak: {dream_text}
                
                Írj egy részletes, első személyű történetet egy napomról a jövőből, amikor már megvalósítottam ezeket.
                A történet legyen realisztikus, inspiráló és pozitív hangulatú. Mutasd be, hogyan változott meg az életem
                és milyen érzés elérni ezeket a célokat."""}
            ],
            temperature=0.8,
            max_tokens=1500
        )
        
        story = response.choices[0].message.content

        return jsonify({
            'story': story,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/generate-routine', methods=['POST'])
def generate_routine():
    data = request.json
    dream_text = data.get('text', '')
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """Te egy professzionális életmód-coach vagy, aki segít az embereknek 
                strukturált napi rutinokat kialakítani céljaik eléréséhez. A rutinoknak konkrétnak, követhetőnek 
                és megvalósíthatónak kell lenniük."""},
                {"role": "user", "content": f"""
                Ezek a céljaim és álmaim: {dream_text}
                
                Készíts egy részletes, időpontokkal ellátott napi rutint, ami segít közelebb kerülni ezekhez a célokhoz.
                A rutin legyen:
                - Időpontokkal ellátva (reggeltől estig)
                - Realisztikus és követhető
                - Tartalmazzon konkrét tevékenységeket
                - Legyen egyensúlyban a produktivitás és a pihenés
                - Tartalmazzon olyan szokásokat, amik hosszú távon a célok felé visznek
                
                Formázd úgy, hogy minden sor egy konkrét időponttal kezdődjön."""}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        routine_text = response.choices[0].message.content
        routine_list = [line.strip() for line in routine_text.split('\n') if line.strip()]

        return jsonify({
            'routine': routine_list,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 