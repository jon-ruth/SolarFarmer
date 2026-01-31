"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";

export function ConnectScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-400 to-sky-600">
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">☀️</div>
        <h1 className="text-4xl font-bold text-white mb-2">SunCity</h1>
        <p className="text-sky-100 text-lg">
          Build solar farms. Power your town.
        </p>
        <p className="text-sky-200 text-sm mt-1">
          Earn rewards & fund real-world solar.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-2xl mb-1">🔆</div>
          <div className="text-xs text-white">Build Solar</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xs text-white">Earn ETH</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <div className="text-2xl mb-1">🌍</div>
          <div className="text-xs text-white">Real Impact</div>
        </div>
      </div>

      {/* Connect Button */}
      <ConnectButton.Custom>
        {({ openConnectModal, connectModalOpen }) => (
          <Button
            size="lg"
            onClick={openConnectModal}
            disabled={connectModalOpen}
            className="bg-solar-500 hover:bg-solar-600 text-white px-8 py-4 text-xl shadow-lg"
          >
            Connect Wallet to Play
          </Button>
        )}
      </ConnectButton.Custom>

      {/* Footer */}
      <div className="mt-8 text-center text-sky-200 text-xs">
        <p>Built on Base • Powered by the Sun</p>
        <p className="mt-1">Supporting the Solar Foundation</p>
      </div>
    </div>
  );
}
