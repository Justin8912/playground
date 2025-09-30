import { css } from 'lit';

// This will be the compiled Tailwind CSS
// You'll need to replace this with the actual compiled CSS from your build process
export const tailwindStyles = css`
  /* Compiled Tailwind CSS will go here */
  /* This is a placeholder - you'll replace this with your PostCSS output */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
`;

// Alternative approach: if you have the CSS as a string, you can use unsafeCSS
// export const tailwindStyles = unsafeCSS(compiledTailwindCssString);
