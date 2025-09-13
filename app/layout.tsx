import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { cookieToInitialState } from 'wagmi'

import { config } from '@/config/WalletProvider'
import Web3ModalProvider from '@/context/AppProvider'

export const metadata: Metadata = {
  title: 'MeMania NFTs',
  description: 'Create AI nfts and mint it to trade an dearn some bucks'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(config, (await headers()).get('cookie'))
  return (
    <html lang="en">
      <body>
        <Web3ModalProvider initialState={initialState}>{children}</Web3ModalProvider>
      </body>
    </html>
  )
}