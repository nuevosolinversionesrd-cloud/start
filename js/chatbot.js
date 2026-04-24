/**
 * Nuevo Sol Inversiones - Property Smart Assistant
 * Keyword-based local AI chatbot for property details
 */

class PropertyChatbot {
    constructor(propertyData) {
        this.prop = propertyData;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const html = `
            <div class="chatbot" id="propertyChatbot">
                <div class="chatbot__button" id="chatbotBtn">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="chatbot__window">
                    <div class="chatbot__header">
                        <div class="chatbot__header-info">
                            <div class="chatbot__avatar">NS</div>
                            <div>
                                <div class="chatbot__title">Asistente Nuevo Sol</div>
                                <div class="chatbot__status">En línea</div>
                            </div>
                        </div>
                        <button class="chatbot__close" id="chatbotClose">&times;</button>
                    </div>
                    <div class="chatbot__messages" id="chatbotMessages">
                        <div class="message message--bot">
                            ¡Hola! Soy tu asistente virtual. Estoy aquí para responder tus dudas sobre <strong>${this.prop.title}</strong>. ¿Qué te gustaría saber?
                        </div>
                    </div>
                    <div class="chatbot__input-area">
                        <input type="text" class="chatbot__input" id="chatbotInput" placeholder="Escribe tu pregunta...">
                        <button class="chatbot__send" id="chatbotSend">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    bindEvents() {
        const btn = document.getElementById('chatbotBtn');
        const close = document.getElementById('chatbotClose');
        const send = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const container = document.getElementById('propertyChatbot');

        btn.addEventListener('click', () => {
            container.classList.toggle('chatbot--active');
            this.isOpen = container.classList.contains('chatbot--active');
            if (this.isOpen) input.focus();
        });

        close.addEventListener('click', () => container.classList.remove('chatbot--active'));

        send.addEventListener('click', () => this.handleMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleMessage();
        });
    }

    handleMessage() {
        const input = document.getElementById('chatbotInput');
        const text = input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        input.value = '';

        this.showTyping();

        setTimeout(() => {
            this.removeTyping();
            const response = this.generateResponse(text);
            this.addMessage(response, 'bot');
        }, 1000);
    }

    addMessage(text, type) {
        const messages = document.getElementById('chatbotMessages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message message--${type}`;
        msgDiv.innerHTML = text;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    showTyping() {
        const messages = document.getElementById('chatbotMessages');
        const typing = document.createElement('div');
        typing.id = 'chatbotTyping';
        typing.className = 'message message--bot message--typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    }

    removeTyping() {
        const typing = document.getElementById('chatbotTyping');
        if (typing) typing.remove();
    }

    generateResponse(query) {
        const q = query.toLowerCase();
        const prop = this.prop;

        // Keywords and responses
        if (q.includes('precio') || q.includes('cuesta') || q.includes('valor')) {
            const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: prop.currency, maximumFractionDigits: 0 }).format(prop.price);
            return `Esta propiedad tiene un precio de <strong>${fmt} ${prop.currency}</strong>.`;
        }

        if (q.includes('habitación') || q.includes('habitaciones') || q.includes('dormitorio') || q.includes('cuarto')) {
            return `Cuenta con <strong>${prop.features.bedrooms} habitaciones</strong> principales. Además, tiene cuartos de servicio adicionales detallados en la descripción.`;
        }

        if (q.includes('baño')) {
            return `La propiedad dispone de <strong>${prop.features.bathrooms} baños completos</strong> y ${prop.features.half_bathrooms} medio baño para visitas.`;
        }

        if (q.includes('parqueo') || q.includes('estacionamiento') || q.includes('vehiculo') || q.includes('marquesina')) {
            return `Tiene capacidad para <strong>${prop.features.parking} vehículos</strong>. El primer nivel está diseñado específicamente para esta comodidad.`;
        }

        if (q.includes('metro') || q.includes('m2') || q.includes('tamaño') || q.includes('area') || q.includes('área')) {
            return `La construcción tiene <strong>${prop.features.area_m2} m²</strong> y se encuentra en un solar de <strong>${prop.features.land_m2} m²</strong>.`;
        }

        if (q.includes('nivel') || q.includes('piso')) {
            return `Es una casa de <strong>${prop.features.floors} niveles</strong>. La distribución está pensada para separar las áreas sociales de las privadas de forma eficiente.`;
        }

        if (q.includes('servicio')) {
            if (prop.description.toLowerCase().includes('servicio')) {
                return `Sí, cuenta con <strong>cuartos de servicio con su propio baño</strong> en el primer nivel.`;
            }
            return `La propiedad incluye áreas de servicio. ¿Te gustaría que un agente te dé más detalles?`;
        }

        if (q.includes('planta') || q.includes('luz') || q.includes('electricidad')) {
            if (prop.description.toLowerCase().includes('planta')) {
                return `¡Sí! La propiedad cuenta con <strong>espacio de planta y la planta está incluida</strong>.`;
            }
        }

        if (q.includes('ubicación') || q.includes('donde') || q.includes('sector') || q.includes('sector')) {
            return `Se encuentra en <strong>${prop.location.neighborhood}, ${prop.location.city}</strong>. Es una zona muy exclusiva y tranquila.`;
        }

        if (q.includes('amenidad') || q.includes('incluye') || q.includes('tiene')) {
            const list = prop.amenities.slice(0, 5).join(', ');
            return `Entre sus amenidades destacan: ${list}, y más. Puedes ver la lista completa en la sección de Amenidades de esta página.`;
        }

        if (q.includes('primer nivel') || q.includes('1er nivel')) {
            return `En el <strong>Primer Nivel</strong> encontrarás: 10 Parqueos, Portón Eléctrico, 2 Cuartos de Servicio, Área de Lavado, Almacén y 2 Family Rooms.`;
        }

        if (q.includes('segundo nivel') || q.includes('2do nivel')) {
            return `El <strong>Segundo Nivel</strong> cuenta con: Terrazas (techada y destechada), Recibidor, Family Room, Estudio, Sala, Cocina y Comedor.`;
        }

        if (q.includes('tercer nivel') || q.includes('3er nivel')) {
            return `El <strong>Tercer Nivel</strong> es el área privada con 4 habitaciones, cada una con su baño. La principal tiene 2 walking closets.`;
        }

        if (q.includes('hola') || q.includes('buenos dias') || q.includes('buenas tardes')) {
            return `¡Hola! ¿En qué puedo ayudarte hoy respecto a esta propiedad?`;
        }

        if (q.includes('gracias') || q.includes('perfecto') || q.includes('ok')) {
            return `¡De nada! Si tienes más preguntas, aquí estaré. También puedes contactarnos por WhatsApp para una atención personalizada.`;
        }

        return `Lo siento, no tengo esa información específica a mano, pero puedo decirte sobre el <strong>precio, habitaciones, parqueos o niveles</strong>. ¿Te gustaría hablar con un asesor humano?`;
    }
}

// Global initialization function
window.initChatbot = function(propData) {
    if (document.getElementById('propertyChatbot')) return;
    new PropertyChatbot(propData);
};
