import { useEffect, useState } from 'react';

// Telegram WebApp SDK ob'ekti
const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const isTMA = !!tg && !!tg.initData;

  useEffect(() => {
    if (!tg) return;

    // TMA ni tayyor deb belgilaymiz
    tg.ready();
    setIsReady(true);

    // Expand to full screen
    tg.expand();

    // Header color
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#080810');
    }

    // Background color
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#080810');
    }
  }, []);

  // User ma'lumotlari
  const user = tg?.initDataUnsafe?.user || null;

  // Back button
  const showBackButton = (onClick) => {
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  };

  const hideBackButton = () => {
    if (!tg) return;
    tg.BackButton.hide();
  };

  // Main button (pastki katta tugma)
  const showMainButton = (text, onClick, color = '#6366f1') => {
    if (!tg) return;
    tg.MainButton.setText(text);
    tg.MainButton.setParams({ color });
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  };

  const hideMainButton = () => {
    if (!tg) return;
    tg.MainButton.hide();
    tg.MainButton.offClick();
  };

  // Haptic feedback
  const haptic = {
    light: () => tg?.HapticFeedback?.impactOccurred('light'),
    medium: () => tg?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => tg?.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    error: () => tg?.HapticFeedback?.notificationOccurred('error'),
    warning: () => tg?.HapticFeedback?.notificationOccurred('warning'),
    selection: () => tg?.HapticFeedback?.selectionChanged(),
  };

  // Close TMA
  const close = () => tg?.close();

  // Open link
  const openLink = (url) => tg?.openLink(url);

  // Send data to bot
  const sendData = (data) => {
    if (!tg) return;
    tg.sendData(JSON.stringify(data));
  };

  // Color scheme
  const colorScheme = tg?.colorScheme || 'dark';

  // Platform
  const platform = tg?.platform || 'unknown';

  // Version
  const version = tg?.version || '0';

  return {
    tg,
    isTMA,
    isReady,
    user,
    colorScheme,
    platform,
    version,
    showBackButton,
    hideBackButton,
    showMainButton,
    hideMainButton,
    haptic,
    close,
    openLink,
    sendData,
  };
}
