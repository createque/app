"""
CSS Templates for 3rd Party Integrations
Automatically applied based on IntegrationType

TimeLOV Branding:
- Primary Color: #1a5f7a
- Secondary Color: #00CC88
- Accent Color: #0066FF
- Font Family: 'Inter', sans-serif
- Border Radius: 8px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
"""

# ═══════════════════════════════════════
# CSS TEMPLATES BY INTEGRATION TYPE
# ═══════════════════════════════════════

CSS_TEMPLATES = {
    # ─────────────────────────────────────
    # ELFSIGHT WIDGETS
    # ─────────────────────────────────────
    
    "ELFSIGHT_REVIEWS": """
/* TimeLOV WhiteLabel CSS for Elfsight Reviews */
.elfsight-app-reviews,
.eapps-google-reviews,
.eapps-reviews-widget {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-reviews .eapps-widget-toolbar {
    background-color: #1a5f7a !important;
    border-radius: 8px 8px 0 0 !important;
}

.elfsight-app-reviews .eapps-review-item {
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    border: 1px solid rgba(26, 95, 122, 0.1) !important;
}

.elfsight-app-reviews .eapps-review-item:hover {
    box-shadow: 0 4px 16px rgba(26, 95, 122, 0.15) !important;
}

.elfsight-app-reviews .eapps-rating-stars svg {
    fill: #00CC88 !important;
}

.elfsight-app-reviews .eapps-button,
.elfsight-app-reviews .eapps-cta-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
}

.elfsight-app-reviews .eapps-button:hover {
    background-color: #155e75 !important;
}
""",

    "ELFSIGHT_INSTAGRAM": """
/* TimeLOV WhiteLabel CSS for Elfsight Instagram Feed */
.elfsight-app-instagram-feed,
.eapps-instagram-feed {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-instagram-feed .eapps-instagram-feed-header {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
    border-radius: 8px 8px 0 0 !important;
    padding: 16px !important;
}

.elfsight-app-instagram-feed .eapps-instagram-feed-header-username {
    color: white !important;
    font-weight: 600 !important;
}

.elfsight-app-instagram-feed .eapps-instagram-feed-posts-item {
    border-radius: 8px !important;
    overflow: hidden !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.elfsight-app-instagram-feed .eapps-instagram-feed-posts-item:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 16px rgba(26, 95, 122, 0.2) !important;
}

.elfsight-app-instagram-feed .eapps-instagram-feed-follow-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}
""",

    "ELFSIGHT_FACEBOOK": """
/* TimeLOV WhiteLabel CSS for Elfsight Facebook Feed */
.elfsight-app-facebook-feed,
.eapps-facebook-feed {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-facebook-feed .eapps-facebook-feed-header {
    background-color: #1a5f7a !important;
    border-radius: 8px 8px 0 0 !important;
}

.elfsight-app-facebook-feed .eapps-facebook-feed-posts-item {
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    margin-bottom: 16px !important;
}

.elfsight-app-facebook-feed .eapps-facebook-feed-follow-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}

.elfsight-app-facebook-feed .eapps-facebook-feed-follow-button:hover {
    background-color: #155e75 !important;
}
""",

    "ELFSIGHT_TESTIMONIALS": """
/* TimeLOV WhiteLabel CSS for Elfsight Testimonials */
.elfsight-app-testimonials,
.eapps-testimonials-slider {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-testimonials .eapps-testimonials-item {
    background: white !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.1) !important;
    padding: 24px !important;
}

.elfsight-app-testimonials .eapps-testimonials-item-quote {
    color: #1a5f7a !important;
    font-style: normal !important;
    line-height: 1.6 !important;
}

.elfsight-app-testimonials .eapps-testimonials-item-author-name {
    color: #1a5f7a !important;
    font-weight: 600 !important;
}

.elfsight-app-testimonials .eapps-testimonials-item-rating svg {
    fill: #00CC88 !important;
}

.elfsight-app-testimonials .eapps-testimonials-nav-dot.eapps-testimonials-nav-dot-active {
    background-color: #1a5f7a !important;
}

.elfsight-app-testimonials .eapps-testimonials-nav-arrow {
    background-color: #1a5f7a !important;
    border-radius: 50% !important;
}
""",

    "ELFSIGHT_PRICING": """
/* TimeLOV WhiteLabel CSS for Elfsight Pricing Table */
.elfsight-app-pricing-table,
.eapps-pricing-table {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-column {
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.1) !important;
    overflow: hidden !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-column-featured {
    border: 2px solid #1a5f7a !important;
    transform: scale(1.02) !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-column-header {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
    color: white !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-column-price {
    color: #1a5f7a !important;
    font-weight: 700 !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-button:hover {
    background-color: #155e75 !important;
    transform: translateY(-1px) !important;
}

.elfsight-app-pricing-table .eapps-pricing-table-feature-icon-checked {
    color: #00CC88 !important;
}
""",

    "ELFSIGHT_FAQ": """
/* TimeLOV WhiteLabel CSS for Elfsight FAQ */
.elfsight-app-faq,
.eapps-faq-accordion {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-faq .eapps-faq-accordion-item {
    border-radius: 8px !important;
    margin-bottom: 8px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
    border: 1px solid rgba(26, 95, 122, 0.1) !important;
}

.elfsight-app-faq .eapps-faq-accordion-item-header {
    background: white !important;
    padding: 16px 20px !important;
}

.elfsight-app-faq .eapps-faq-accordion-item-header:hover {
    background: rgba(26, 95, 122, 0.05) !important;
}

.elfsight-app-faq .eapps-faq-accordion-item.eapps-faq-accordion-item-expanded .eapps-faq-accordion-item-header {
    background: #1a5f7a !important;
    color: white !important;
}

.elfsight-app-faq .eapps-faq-accordion-item-title {
    font-weight: 600 !important;
}

.elfsight-app-faq .eapps-faq-accordion-item-body {
    padding: 16px 20px !important;
    line-height: 1.6 !important;
}
""",

    "ELFSIGHT_FORM": """
/* TimeLOV WhiteLabel CSS for Elfsight Form Builder */
.elfsight-app-form-builder,
.eapps-form-builder {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.elfsight-app-form-builder .eapps-form-builder-widget {
    background: white !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.1) !important;
    padding: 24px !important;
}

.elfsight-app-form-builder .eapps-form-builder-field-input,
.elfsight-app-form-builder .eapps-form-builder-field-textarea {
    border-radius: 8px !important;
    border: 1px solid rgba(26, 95, 122, 0.2) !important;
    padding: 12px 16px !important;
}

.elfsight-app-form-builder .eapps-form-builder-field-input:focus,
.elfsight-app-form-builder .eapps-form-builder-field-textarea:focus {
    border-color: #1a5f7a !important;
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1) !important;
}

.elfsight-app-form-builder .eapps-form-builder-submit-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
}

.elfsight-app-form-builder .eapps-form-builder-submit-button:hover {
    background-color: #155e75 !important;
}
""",

    # ─────────────────────────────────────
    # FRILL (ROADMAP)
    # ─────────────────────────────────────
    
    "FRILL_ROADMAP": """
/* TimeLOV WhiteLabel CSS for Frill.co Roadmap */
iframe.frill-embed,
.frill-widget-container iframe {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.15) !important;
    width: 100% !important;
    min-height: 600px !important;
}

.frill-widget-container {
    background: white !important;
    border-radius: 12px !important;
    overflow: hidden !important;
}

/* Frill inline widget styles (when loaded in same domain) */
.frill-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.frill-container .frill-header {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
}

.frill-container .frill-idea-card {
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.frill-container .frill-vote-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}

.frill-container .frill-status-planned {
    background-color: #0066FF !important;
}

.frill-container .frill-status-in-progress {
    background-color: #00CC88 !important;
}

.frill-container .frill-status-completed {
    background-color: #1a5f7a !important;
}
""",

    # ─────────────────────────────────────
    # LIVEAGENT (CHAT)
    # ─────────────────────────────────────
    
    "LIVEAGENT_CHAT": """
/* TimeLOV WhiteLabel CSS for LiveAgent Chat */

/* Chat Button */
#la-chat-button,
.la-chat-button,
.LiveAgentButton {
    background-color: #1a5f7a !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.4) !important;
    width: 60px !important;
    height: 60px !important;
}

#la-chat-button:hover,
.la-chat-button:hover,
.LiveAgentButton:hover {
    background-color: #155e75 !important;
    transform: scale(1.05) !important;
    box-shadow: 0 6px 24px rgba(26, 95, 122, 0.5) !important;
}

/* Chat Window */
.InfoPanel,
.la-chat-header,
.ChatHeader {
    background-color: #1a5f7a !important;
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
    border-top-left-radius: 12px !important;
    border-top-right-radius: 12px !important;
}

.ChatFrame,
.la-chat-window,
#la-chat-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(26, 95, 122, 0.3) !important;
}

/* Chat Messages */
.la-chat-message-agent,
.AgentMessage {
    background-color: #f1f5f9 !important;
    border-radius: 12px 12px 12px 4px !important;
}

.la-chat-message-visitor,
.VisitorMessage {
    background-color: #1a5f7a !important;
    color: white !important;
    border-radius: 12px 12px 4px 12px !important;
}

/* Input Field */
.la-chat-input,
.ChatInput input,
.ChatInput textarea {
    border-radius: 8px !important;
    border: 1px solid rgba(26, 95, 122, 0.2) !important;
}

.la-chat-input:focus,
.ChatInput input:focus {
    border-color: #1a5f7a !important;
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1) !important;
}

/* Send Button */
.la-chat-send-button,
.SendButton {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}

.la-chat-send-button:hover,
.SendButton:hover {
    background-color: #155e75 !important;
}

/* Pre-chat Form */
.la-prechat-form,
.PreChatForm {
    font-family: 'Inter', sans-serif !important;
}

.la-prechat-form input,
.PreChatForm input {
    border-radius: 8px !important;
}

.la-prechat-form button,
.PreChatForm button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}
""",

    # ─────────────────────────────────────
    # TACU.COOL (ENGAGEMENT)
    # ─────────────────────────────────────
    
    "TACU_POPUP": """
/* TimeLOV WhiteLabel CSS for Tacu.cool Popup */
.tacu-popup,
.tacu-modal,
[data-tacu-popup] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(26, 95, 122, 0.3) !important;
    overflow: hidden !important;
}

.tacu-popup-header,
.tacu-modal-header {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
    color: white !important;
    padding: 20px 24px !important;
}

.tacu-popup-body,
.tacu-modal-body {
    padding: 24px !important;
}

.tacu-popup-close,
.tacu-modal-close {
    color: white !important;
    opacity: 0.8 !important;
}

.tacu-popup-close:hover,
.tacu-modal-close:hover {
    opacity: 1 !important;
}

.tacu-popup-button,
.tacu-cta-button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    color: white !important;
}

.tacu-popup-button:hover,
.tacu-cta-button:hover {
    background-color: #155e75 !important;
    transform: translateY(-1px) !important;
}

.tacu-popup-input,
.tacu-form-input {
    border-radius: 8px !important;
    border: 1px solid rgba(26, 95, 122, 0.2) !important;
    padding: 12px 16px !important;
}

.tacu-popup-input:focus,
.tacu-form-input:focus {
    border-color: #1a5f7a !important;
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1) !important;
}
""",

    "TACU_BANNER": """
/* TimeLOV WhiteLabel CSS for Tacu.cool Banner */
.tacu-banner,
.tacu-sticky-bar,
[data-tacu-banner] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
    color: white !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.3) !important;
}

.tacu-banner-text {
    font-weight: 500 !important;
}

.tacu-banner-button,
.tacu-banner-cta {
    background-color: white !important;
    color: #1a5f7a !important;
    border-radius: 8px !important;
    padding: 8px 20px !important;
    font-weight: 600 !important;
}

.tacu-banner-button:hover,
.tacu-banner-cta:hover {
    background-color: #f1f5f9 !important;
    transform: translateY(-1px) !important;
}

.tacu-banner-close {
    color: white !important;
    opacity: 0.7 !important;
}

.tacu-banner-close:hover {
    opacity: 1 !important;
}
""",

    # ─────────────────────────────────────
    # MALCOLM (KNOWLEDGE BASE)
    # ─────────────────────────────────────
    
    "MALCOLM_DOCS": """
/* TimeLOV WhiteLabel CSS for Malcolm Knowledge Base */
iframe.malcolm-embed,
.malcolm-widget-container iframe {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.15) !important;
    width: 100% !important;
    min-height: 500px !important;
}

.malcolm-widget-container {
    background: white !important;
    border-radius: 12px !important;
    overflow: hidden !important;
}

/* Malcolm inline styles (when embedded) */
.malcolm-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.malcolm-header {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
    color: white !important;
}

.malcolm-search-input {
    border-radius: 8px !important;
    border: 1px solid rgba(26, 95, 122, 0.2) !important;
}

.malcolm-search-input:focus {
    border-color: #1a5f7a !important;
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1) !important;
}

.malcolm-article-card {
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.malcolm-article-card:hover {
    box-shadow: 0 4px 16px rgba(26, 95, 122, 0.15) !important;
    transform: translateY(-2px) !important;
}

.malcolm-category-header {
    color: #1a5f7a !important;
    font-weight: 600 !important;
}

.malcolm-btn-primary {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}
""",

    # ─────────────────────────────────────
    # CRISP (CHAT)
    # ─────────────────────────────────────
    
    "CRISP_CHAT": """
/* TimeLOV WhiteLabel CSS for Crisp Chat */
.crisp-client .cc-1brb {
    background-color: #1a5f7a !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.4) !important;
}

.crisp-client .cc-1brb:hover {
    background-color: #155e75 !important;
}

.crisp-client .cc-1m2m {
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(26, 95, 122, 0.3) !important;
}

.crisp-client .cc-1ada {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
}

.crisp-client .cc-7doi input {
    border-radius: 8px !important;
}

.crisp-client .cc-7doi button {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}
""",

    # ─────────────────────────────────────
    # INTERCOM (CHAT)
    # ─────────────────────────────────────
    
    "INTERCOM_CHAT": """
/* TimeLOV WhiteLabel CSS for Intercom */
.intercom-launcher {
    background-color: #1a5f7a !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.4) !important;
}

.intercom-launcher:hover {
    background-color: #155e75 !important;
}

.intercom-messenger-frame {
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(26, 95, 122, 0.3) !important;
}

.intercom-namespace .intercom-1eaan3k {
    background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%) !important;
}
""",

    # ─────────────────────────────────────
    # CUSTOM (FALLBACK)
    # ─────────────────────────────────────
    
    "CUSTOM": """
/* TimeLOV Default WhiteLabel CSS for Custom Integrations */
.timelove-widget {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.timelove-widget iframe {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26, 95, 122, 0.15) !important;
}

.timelove-widget .btn-primary,
.timelove-widget [class*="button"],
.timelove-widget [class*="btn"] {
    background-color: #1a5f7a !important;
    border-radius: 8px !important;
}

.timelove-widget input,
.timelove-widget textarea,
.timelove-widget select {
    border-radius: 8px !important;
    border: 1px solid rgba(26, 95, 122, 0.2) !important;
}

.timelove-widget input:focus,
.timelove-widget textarea:focus {
    border-color: #1a5f7a !important;
    box-shadow: 0 0 0 3px rgba(26, 95, 122, 0.1) !important;
}
"""
}


# ═══════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════

def get_css_for_type(integration_type: str) -> str:
    """Get CSS template for a given integration type"""
    return CSS_TEMPLATES.get(integration_type, CSS_TEMPLATES.get("CUSTOM", ""))


def get_all_css_types() -> list:
    """Get list of all available CSS template types"""
    return list(CSS_TEMPLATES.keys())


def minify_css(css: str) -> str:
    """Minify CSS by removing extra whitespace and comments"""
    import re
    # Remove comments
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    # Remove extra whitespace
    css = re.sub(r'\s+', ' ', css)
    # Remove space around special characters
    css = re.sub(r'\s*([{};:,])\s*', r'\1', css)
    return css.strip()


def get_combined_css_for_integrations(integration_types: list) -> str:
    """Get combined CSS for multiple integration types"""
    combined = []
    seen_types = set()
    
    for int_type in integration_types:
        if int_type not in seen_types:
            css = get_css_for_type(int_type)
            if css:
                combined.append(f"/* {int_type} */")
                combined.append(css)
            seen_types.add(int_type)
    
    return "\n".join(combined)


# ═══════════════════════════════════════
# BRANDING VARIABLES
# ═══════════════════════════════════════

TIMELOVE_BRANDING = {
    "primary_color": "#1a5f7a",
    "secondary_color": "#00CC88",
    "accent_color": "#0066FF",
    "font_family": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    "border_radius": "8px",
    "border_radius_lg": "12px",
    "box_shadow": "0 2px 8px rgba(0,0,0,0.1)",
    "box_shadow_lg": "0 4px 20px rgba(26, 95, 122, 0.15)",
    "box_shadow_xl": "0 10px 40px rgba(26, 95, 122, 0.3)"
}


def generate_css_variables() -> str:
    """Generate CSS custom properties for TimeLOV branding"""
    return f"""
:root {{
    --timelove-primary: {TIMELOVE_BRANDING['primary_color']};
    --timelove-secondary: {TIMELOVE_BRANDING['secondary_color']};
    --timelove-accent: {TIMELOVE_BRANDING['accent_color']};
    --timelove-font: {TIMELOVE_BRANDING['font_family']};
    --timelove-radius: {TIMELOVE_BRANDING['border_radius']};
    --timelove-radius-lg: {TIMELOVE_BRANDING['border_radius_lg']};
    --timelove-shadow: {TIMELOVE_BRANDING['box_shadow']};
    --timelove-shadow-lg: {TIMELOVE_BRANDING['box_shadow_lg']};
    --timelove-shadow-xl: {TIMELOVE_BRANDING['box_shadow_xl']};
}}
"""
