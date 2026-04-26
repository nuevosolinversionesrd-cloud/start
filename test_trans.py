from googletrans import Translator
import time
translator = Translator()
try:
    res = translator.translate('Hola Mundo', dest='en')
    print(res.text)
except Exception as e:
    print(e)
