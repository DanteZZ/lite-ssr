export function formatErrorToHtml(error: Error): string {
    const { name, message, stack } = error;

    // Экранируем специальные символы HTML
    const escapeHtml = (text: string): string =>
        text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const escapedMessage = escapeHtml(message);
    const escapedStack = stack ? escapeHtml(stack) : 'No stack trace available';

    // Генерация HTML
    return `
      <div style="
        font-family: Arial, sans-serif; 
        background-color: #f8d7da; 
        color: #721c24; 
        padding: 20px; 
        border: 1px solid #f5c6cb; 
        border-radius: 5px; 
        margin: 20px; 
      ">
        <h2 style="margin-top: 0;">${escapeHtml(name)}</h2>
        <p><strong>Message:</strong> ${escapedMessage}</p>
        <pre style="
          background-color: #f5f5f5; 
          padding: 10px; 
          border: 1px solid #ddd; 
          border-radius: 5px; 
          overflow-x: auto; 
          white-space: pre-wrap; 
          font-size: 14px;
        ">${escapedStack}</pre>
      </div>
    `;
}