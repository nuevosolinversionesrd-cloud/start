/**
 * Nuevo Sol Inversiones - AI Smart Assistant (State Machine)
 * zero-cost, 100% functional simulated AI with Persona Routing
 */

class PropertyChatbot {
    constructor(propertyData) {
        this.prop = propertyData;
        this.isOpen = false;
        this.state = 'START';
        this.userData = {};
        this.persona = this.selectPersona();
        this.init();
    }

    selectPersona() {
        const zone = this.prop.location.zone_type;
        if (zone === 'city') {
            return {
                id: 'santi',
                name: 'Santi',
                title: 'Especialista en Lujo Urbano',
                avatar: 'S',
                color: '#1e293b',
                welcome: `Hola, soy Santi, tu estratega en bienes raíces urbanos. Veo que tienes buen ojo; has seleccionado una propiedad en una de las zonas de mayor plusvalía de la ciudad. Mi trabajo es ayudarte a maximizar tu patrimonio. ¿Buscamos una rentabilidad a largo plazo o es para tu residencia principal?`
            };
        } else if (zone === 'coast' || zone === 'beach') {
            return {
                id: 'marina',
                name: 'Marina',
                title: 'Experta en Costa y Turismo',
                avatar: 'M',
                color: '#0891b2',
                welcome: `¡Hola! Qué gusto saludarte, soy Marina. 🌴 Acabas de ver una de mis propiedades favoritas frente al mar. Aquí no solo invertimos en ladrillos, invertimos en calidad de vida y en el mejor rendimiento por alquiler vacacional. ¿Buscamos tu propio pedacito de paraíso para retirarte, o quieres que pongamos esta propiedad a generar dólares en Airbnb?`
            };
        } else if (zone === 'mountain') {
            return {
                id: 'monte',
                name: 'Monte',
                title: 'Asesor de Retiro y Naturaleza',
                avatar: 'MT',
                color: '#15803d',
                welcome: `Saludos. Soy Monte, tu guía en los altos valles. Has elegido una zona espectacular donde el clima y la paz no tienen precio. Cuando invertimos en la montaña, el éxito está en los detalles técnicos y yo estoy aquí para cuidarte. Cuéntame, ¿estamos buscando un refugio familiar o un terreno para desarrollar un proyecto ecológico?`
            };
        }
        // Default to Dominic for general queries or if zone is missing
        return {
            id: 'dominic',
            name: 'Dominic',
            title: 'Concierge Legal y Global',
            avatar: 'D',
            color: '#111827',
            welcome: `Hi, I'm Dominic. My mission is to ensure your investment in the Dominican Republic is 100% secure and transparent. I will guide you through due diligence and the formal title transfer process. Is this your first time investing in the DR, or are you already familiar with our legal framework?`
        };
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        if (document.getElementById('propertyChatbot')) return;
        
        const html = `
            <div class="chatbot" id="propertyChatbot">
                <div class="chatbot__button" id="chatbotBtn" style="background:${this.persona.color}">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="chatbot__window">
                    <div class="chatbot__header" style="background:${this.persona.color}">
                        <div class="chatbot__header-info">
                            <div class="chatbot__avatar">${this.persona.avatar}</div>
                            <div>
                                <div class="chatbot__title">${this.persona.name}</div>
                                <div class="chatbot__status">${this.persona.title}</div>
                            </div>
                        </div>
                        <button class="chatbot__close" id="chatbotClose">&times;</button>
                    </div>
                    <div class="chatbot__messages" id="chatbotMessages">
                        <div class="message message--bot">${this.persona.welcome}</div>
                    </div>
                    <div class="chatbot__input-area">
                        <input type="text" class="chatbot__input" id="chatbotInput" placeholder="Escribe tu respuesta...">
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
            const response = this.processResponse(text);
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

    processResponse(text) {
        const q = text.toLowerCase();
        
        // Handoff to Dominic if legal/bank keywords detected
        if ((q.includes('abogado') || q.includes('legal') || q.includes('banco') || q.includes('titulo') || q.includes('ley')) && this.persona.id !== 'dominic') {
            this.persona = {
                id: 'dominic',
                name: 'Dominic',
                title: 'Concierge Legal y Global',
                avatar: 'D',
                color: '#111827',
                welcome: `Saludos, mi nombre es Dominic y soy el Concierge Legal de la plataforma. Noto que estamos entrando en detalles jurídicos y financieros, así que he venido a apoyarte personalmente.`
            };
            this.updateHeader();
            return `${this.persona.welcome} Mi misión es garantizar que tu capital esté seguro y que tu proceso de compra cumpla con todas las normativas de la República Dominicana. ¿Qué duda legal o bancaria tienes?`;
        }

        // Logic based on state
        switch(this.state) {
            case 'START':
                this.userData.goal = text;
                if (this.prop.location.is_tourist_zone) {
                    this.state = 'CONFOTUR';
                    return `¡Interesante perspectiva! Por cierto, al ser esta una propiedad en zona turística, ¿estás familiarizado con los beneficios de la **Ley de Confotur**? Podrías ahorrarte el 3% del impuesto de transferencia.`;
                } else {
                    this.state = 'URGENCY';
                    return `¡Entendido! Para darte prioridad en la agenda, ¿tienes pensado realizar esta inversión en los próximos 30, 60 o 90 días?`;
                }
            
            case 'CONFOTUR':
                this.state = 'URGENCY';
                return `Es un beneficio clave para maximizar tu retorno. Ahora, para coordinar los próximos pasos, ¿tienes pensado realizar esta inversión en los próximos 30, 60 o 90 días?`;

            case 'URGENCY':
                this.userData.timeframe = text;
                this.state = 'FINANCE';
                return `Perfecto, tomamos nota de tu urgencia. Para asegurar que la propiedad encaje con tu perfil financiero, ¿ya cuentas con una pre-aprobación bancaria o planeas realizar la compra de contado?`;

            case 'FINANCE':
                this.userData.finance = text;
                this.state = 'IDENTITY';
                return `Excelente. Para enviarte el **Dossier Informativo** con fotos de alta resolución, la ubicación exacta y el historial de rentabilidad, ¿podrías confirmarme tu nombre completo y correo electrónico?`;

            case 'IDENTITY':
                const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (!emailMatch) {
                    return `Disculpa, necesito un correo electrónico válido para enviarte la documentación oficial.`;
                }
                this.userData.name_email = text;
                this.state = 'COMPLETE';
                this.submitLead();
                return `¡Todo listo, ${text.split(' ')[0]}! He generado tu **Certificado de Visita Digital** (ID: NSI-${Math.floor(Math.random()*10000)}). Acabo de enviar el expediente completo a tu correo. ¿Te gustaría que agendemos una videollamada para ver los detalles hoy mismo?`;

            case 'COMPLETE':
                return `Gracias por tu interés. Un asesor humano se pondrá en contacto contigo a la brevedad para coordinar la visita.`;

            default:
                return this.fallbackResponse(q);
        }
    }

    updateHeader() {
        const header = document.querySelector('.chatbot__header');
        const avatar = document.querySelector('.chatbot__avatar');
        const title = document.querySelector('.chatbot__title');
        const status = document.querySelector('.chatbot__status');
        const btn = document.getElementById('chatbotBtn');

        header.style.background = this.persona.color;
        btn.style.background = this.persona.color;
        avatar.textContent = this.persona.avatar;
        title.textContent = this.persona.name;
        status.textContent = this.persona.title;
    }

    fallbackResponse(q) {
        if (q.includes('precio') || q.includes('cuesta')) {
            const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: this.prop.currency }).format(this.prop.price);
            return `Esta propiedad tiene un valor de ${fmt} ${this.prop.currency}.`;
        }
        return `Esa es una buena pregunta. ¿Te gustaría que te envíe los detalles legales completos a tu correo?`;
    }

    submitLead() {
        console.log('Capturing Lead:', this.userData);
        // Here we could trigger a fetch to Google Apps Script
        if (window.submitLeadToSheets) {
            window.submitLeadToSheets(this.userData);
        }
    }
}

window.initChatbot = function(propData) {
    new PropertyChatbot(propData);
};
