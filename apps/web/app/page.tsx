import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, EyeOff, CheckCircle2, ChevronRight, Swords, Dices } from "lucide-react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 lg:px-14 h-16 flex items-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground">
            SA
          </div>
          <span className="font-bold text-lg tracking-tight">ShadowArena</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">
            How it works
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#games">
            Games
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#docs">
            Docs
          </Link>
          <WalletConnectButton />
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Play with hidden hands. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                    Win with verified proof.
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The premium ZK gaming table built on Midnight. Cheat-proof by construction. Private by default.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90">
                  Enter the Arena
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border">
                  Read the Docs
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Strip */}
        <section className="w-full py-12 border-y border-border/40 bg-card/50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="flex flex-col items-center justify-center space-y-2 pt-4 sm:pt-0">
                <div className="text-4xl font-bold font-mono text-foreground">14,205</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Games Played</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 pt-4 sm:pt-0">
                <div className="text-4xl font-bold font-mono text-accent-gold">2.4M</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Staked</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 pt-4 sm:pt-0">
                <div className="text-4xl font-bold font-mono text-secondary">28,410</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Proofs Verified</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Powered by Zero-Knowledge cryptography, ensuring absolute fairness without sacrificing privacy.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3">
              <Card className="bg-card border-border shadow-none">
                <CardHeader>
                  <EyeOff className="w-10 h-10 text-primary mb-2" />
                  <CardTitle className="text-xl">1. Your Hand Stays Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your cards and moves are kept entirely on your device. The smart contract only sees zero-knowledge proofs.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-none">
                <CardHeader>
                  <CheckCircle2 className="w-10 h-10 text-secondary mb-2" />
                  <CardTitle className="text-xl">2. Moves Proven Valid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every action generates a cryptographic proof ensuring you follow the rules, instantly verified by the network.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-none">
                <CardHeader>
                  <Shield className="w-10 h-10 text-accent-gold mb-2" />
                  <CardTitle className="text-xl">3. Payout Settles On-Chain</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    When the game ends, the verified winner automatically claims the staked pot from the trustless smart contract.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Game Modes */}
        <section id="games" className="w-full py-24 md:py-32 bg-muted/30 border-y border-border/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">The Arena</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose your battleground.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl items-center gap-6 md:grid-cols-2">
              <Card className="bg-card border-border overflow-hidden group">
                <div className="h-48 bg-muted relative flex items-center justify-center">
                  <Swords className="w-20 h-20 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">High Card Duel</CardTitle>
                  <CardDescription>A fast-paced bluffing game. Highest hidden card wins the pot.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full group-hover:bg-primary transition-colors">
                    Play Now <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
              <Card className="bg-card border-border overflow-hidden group">
                <div className="h-48 bg-muted relative flex items-center justify-center">
                  <Dices className="w-20 h-20 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Dice Duel</CardTitle>
                  <CardDescription>Predict the roll, hide your wager. (Coming Soon)</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="secondary" disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-card border-t border-border">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ShadowArena. Built on Midnight Network.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
              Terms
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
              Privacy
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
              GitHub
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
