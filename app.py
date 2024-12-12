from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Email beállítások
SMTP_SERVER = "smtp.hostinger.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv('SENDER_EMAIL')  # például: your-email@gmail.com
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')  # App jelszó Gmail esetén
RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL')  # ahova az adatokat küldjük

def send_log_email(input_text, generated_text, endpoint):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECIPIENT_EMAIL
        msg['Subject'] = f"Új álom log - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        body = f"""
        Időpont: {datetime.now()}
        Endpoint: {endpoint}
        IP: {request.remote_addr}
        
        Beküldött szöveg:
        {input_text}
        
        Generált válasz:
        {generated_text}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        
    except Exception as e:
        print(f"Email küldési hiba: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process-dreams', methods=['POST'])
def process_dreams():
    data = request.json
    dream_text = data.get('text', '')
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """Te egy kreatív író vagy, aki inspiráló és részletes történeteket ír. 
                A feladatod az, hogy a felhasználó álmait és céljait egy élénk, első személyű történetté alakítsd át,
                ami egy napot mutat be a jövőbeli életükből, amikor már elérték ezeket a célokat. Konkrét neveket ne használj. """},
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
        
        # Email küldése a logokkal
        send_log_email(dream_text, story, 'process-dreams')

        return jsonify({
            'story': story,
            'success': True
        })
    except Exception as e:
        # Hiba esetén is küldjünk emailt
        send_log_email(dream_text, str(e), 'process-dreams-error')
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
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """Te egy professzionális életmód-coach vagy, aki segít az embereknek 
                strukturált napi rutinokat kialakítani céljaik eléréséhez. A rutinoknak konkrétnak, követhetőnek 
                és megvalósíthatónak kell lenniük."""},
                {"role": "user", "content": f"""
                Ezek a céljaim és álmaim: {dream_text}
                
                Készíts egy részletes, időpontokkal ellátott napi rutint, ami segít közelebb kerülni ezekhez a célokhoz.
                A rutin legyen:
                - Időpontokkal ellátva (reggeltől estig, összesen max 6-7 pontban)
                - Realisztikus és követhető
                - Tartalmazzon konkrét tevékenységeket, vizualizációkat
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