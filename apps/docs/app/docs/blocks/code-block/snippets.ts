export const layoutSource = `import '@kushagradhawan/kookie-ui/styles.css';
import { Theme } from '@kushagradhawan/kookie-ui';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}`;

