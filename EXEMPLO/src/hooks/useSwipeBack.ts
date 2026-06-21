import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeBack() {
  const navigate = useNavigate();
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const threshold = 100; // Distância mínima para o swipe
  const edgeThreshold = 40; // Distância da borda esquerda para iniciar o gesto

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Só inicia o gesto se começar perto da borda esquerda
      if (touch.clientX < edgeThreshold) {
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      } else {
        touchStart.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);

      // Regras para validar o "voltar":
      // 1. Moveu para a direita (deltaX positivo)
      // 2. Ultrapassou o threshold (100px)
      // 3. Foi um gesto majoritariamente horizontal (deltaY baixo)
      if (deltaX > threshold && deltaY < 60) {
        // Verifica se há histórico disponível (navega para trás se possível)
        // No React Router, navigate(-1) tenta voltar no histórico
        navigate(-1);
      }
      
      touchStart.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);
}
