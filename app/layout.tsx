export const metadata = {
    title: 'IITSec Refer App',
    description: 'Client-side Next.js application',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

