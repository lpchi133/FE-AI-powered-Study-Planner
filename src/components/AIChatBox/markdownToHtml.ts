// Function to convert markdown-like syntax (e.g., **bold**) to HTML
export const convertToHtml = (text: string): string => {
    // Convert **bold** to <strong>
    let htmlText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Convert *italic* or _italic_ to <em>
    htmlText = htmlText.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
    
    // Convert `code` to <code>
    htmlText = htmlText.replace(/`([^`]+)`/g, "<code>$1</code>");
    
    // Convert new lines to <p> for paragraph separation
    htmlText = htmlText.replace(/\n/g, "<p></p>");
    
    // Optional: Handle headers (e.g., # Header to <h1>)
    htmlText = htmlText.replace(/^(#{1,6})\s*(.*?)$/gm, (match, hashes, title) => {
      const level = hashes.length; // Level of header
      return `<h${level}>${title}</h${level}>`; // Return corresponding header tag
    });
  
    // Convert * at the beginning of the line to unordered list <ul><li>
    // Ensure it's a standalone item, handling multiline lists
    htmlText = htmlText.replace(/^\*\s+(.*)$/gm, "<ul><li>$1</li></ul>");
    
    // If there are multiple items in the same list, wrap them with <ul>
    htmlText = htmlText.replace(/(\n\s*\*\s+[^\n]+)/g, (match) => {
      return `<ul><li>${match.replace(/\*\s+/g, "")}</li></ul>`;
    });
  
    return htmlText;
  };
  