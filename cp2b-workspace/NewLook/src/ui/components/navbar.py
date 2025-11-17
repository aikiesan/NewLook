"""
Componente de barra de navegação para CP2B Maps V3.
"""
import streamlit as st
from typing import Optional, Dict, Any

from config.settings import THEME

def render_navbar(user: Optional[Dict[str, Any]] = None) -> str:
    """
    Renderiza a barra de navegação principal.

    Args:
        user: Dados do usuário logado (opcional)

    Returns:
        Página selecionada pelo usuário
    """
    # CSS para estilização da navbar
    navbar_css = f"""
    <style>
    .navbar {{
        background: linear-gradient(90deg, {THEME['primary_color']} 0%, {THEME['secondary_color']} 100%);
        padding: 1rem 0;
        margin-bottom: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }}
    .navbar-content {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
    }}
    .navbar-brand {{
        color: white !important;
        font-size: 1.5rem;
        font-weight: bold;
        text-decoration: none;
    }}
    .navbar-nav {{
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0;
        padding: 0;
    }}
    .nav-link {{
        color: white !important;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        transition: background-color 0.3s;
    }}
    .nav-link:hover {{
        background-color: rgba(255,255,255,0.1);
    }}
    .nav-link.active {{
        background-color: rgba(255,255,255,0.2);
        font-weight: bold;
    }}
    .user-info {{
        color: white;
        font-size: 0.9rem;
    }}
    </style>
    """

    st.markdown(navbar_css, unsafe_allow_html=True)

    # Menu principal
    menu_items = [
        ("🏠 Home", "home"),
        ("📊 Dashboard", "dashboard"),
        ("🗺 Análises", "analyses"),
        ("ℹ️ Sobre", "about")
    ]

    # Adicionar itens específicos para usuários logados
    if user:
        menu_items.extend([
            ("🤖 Bagacinho IA", "assistant"),
            ("👤 Perfil", "profile")
        ])
    else:
        menu_items.append(("🔐 Login", "login"))

    # Renderizar navbar usando selectbox temporário
    # TODO: Implementar navegação mais sofisticada
    col1, col2 = st.columns([3, 1])

    with col1:
        st.markdown(
            f"""
            <div class="navbar">
                <div class="navbar-content">
                    <a href="#" class="navbar-brand">🌱 CP2B Maps V3</a>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

    with col2:
        if user:
            st.markdown(
                f"<div class='user-info'>👋 Olá, {user.get('name', 'Usuário')}</div>",
                unsafe_allow_html=True
            )

    # Menu de navegação temporário (será substituído por tabs ou sidebar)
    selected_page = st.selectbox(
        "Navegação:",
        options=[item[1] for item in menu_items],
        format_func=lambda x: next(item[0] for item in menu_items if item[1] == x),
        key="navbar_selection"
    )

    return selected_page

def get_navigation_state() -> str:
    """
    Obtém o estado atual da navegação.

    Returns:
        Página atualmente selecionada
    """
    if "navbar_selection" not in st.session_state:
        st.session_state.navbar_selection = "home"

    return st.session_state.navbar_selection