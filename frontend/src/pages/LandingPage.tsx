import { useNavigate } from 'react-router-dom';
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { ModeToggle } from '../components/mode-toggle';

export function LandingPage() {
    const { isSignedIn } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isSignedIn) {
            navigate('/app');
        }
    };

    const logoAscii = `
               _________   _____      _____ _____________________              
            /   _____/  /     \\    /  _  \\\\______   \\__    ___/              
            \\_____  \\  /  \\ /  \\  /  /_\\  \\|       _/ |    |                 
            /        \\/    Y    \\/    |    \\    |   \\ |    |                 
           /_______  /\\____|__  /\\____|__  /____|_  / |____|                 
                   \\/         \\/         \\/       \\/                         
  ___ ___ .___  ________  ___ ___ .____    .___  ________  ___ ______________
 /   |   \\|   |/  _____/ /   |   \\|    |   |   |/  _____/ /   |   \\__    ___/
/    ~    \\   /   \\  ___/    ~    \\    |   |   /   \\  ___/    ~    \\|    |   
\\    Y    /   \\    \\_\\  \\    Y    /    |___|   \\    \\_\\  \\    Y    /|    |   
 \\___|_  /|___|\\______  /\\___|_  /|_______ \\___|\\______  /\\___|_  / |____|   
                   \\/             \\/       \\/         \\/           \\/       \\/                       
    `;



    const feature1Ascii = `
 [ FAST ]
  >>>>>
  >>>>>
  >>>>>
    `;

    const feature2Ascii = `
 [ PRECISE ]
   ( * )
    \\|/
     |
    `;

    const feature3Ascii = `
 [ SECURE ]
   /---\\
   |[_]|
   \\---/
    `;

    return (
        <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
            {/* Grid Background Effect */}
            <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(var(--color-muted-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-muted-foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navigation */}
                <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full border-b border-border">
                    <div className="text-sm md:text-base font-bold tracking-tighter">
                        SMARTHIGHLIGHT_V2.0
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        {isSignedIn ? (
                            <button
                                onClick={handleGetStarted}
                                className="px-4 py-2 text-sm border border-input bg-card text-foreground hover:bg-foreground hover:text-background transition-colors"
                            >
                                [ SYSTEM_CORE ]
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 text-sm border border-muted-foreground hover:border-foreground text-muted-foreground hover:text-foreground transition-colors">
                                    SIGN_IN
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">

                    {/* ASCII Logo/Art */}
                    <pre className="text-[10px] md:text-sm leading-none whitespace-pre text-foreground mb-8 select-none animate-in fade-in zoom-in duration-1000">
                        {logoAscii}
                    </pre>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-foreground uppercase">
                        Enhance Your <br />
                        Reading Capability
                    </h1>

                    <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-12 uppercase tracking-wide">
                        // Upload PDF. AI Analysis. Instant Highlights. <br />
                        // No distractions. Pure information.
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {isSignedIn ? (
                            <button
                                onClick={handleGetStarted}
                                className="group relative px-8 py-4 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-muted-foreground transition-all"
                            >
                                <span className="absolute inset-0 border-2 border-foreground translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform bg-background -z-10"></span>
                                Launch System
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="group relative px-8 py-4 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-muted-foreground transition-all">
                                    <span className="absolute inset-0 border-2 border-foreground translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform bg-background -z-10"></span>
                                    Initialize System
                                </button>
                            </SignInButton>
                        )}

                    </div>

                    <div className="mt-24 md:mt-32 w-full max-w-4xl mx-auto border border-border p-2">
                        <div className="border border-border p-8 md:p-12 bg-background/50 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row items-center justify-around gap-12 font-mono text-xs md:text-sm">
                                <div className="text-center group cursor-default">
                                    <pre className="mb-4 text-muted-foreground group-hover:text-foreground transition-colors">{feature1Ascii}</pre>
                                    <p className="uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Speed</p>
                                </div>
                                <div className="text-center group cursor-default">
                                    <pre className="mb-4 text-muted-foreground group-hover:text-foreground transition-colors">{feature2Ascii}</pre>
                                    <p className="uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Accuracy</p>
                                </div>
                                <div className="text-center group cursor-default">
                                    <pre className="mb-4 text-muted-foreground group-hover:text-foreground transition-colors">{feature3Ascii}</pre>
                                    <p className="uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Security</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Architecture / Explanation Section */}
                    <div className="mt-32 w-full max-w-5xl mx-auto px-4 text-left mb-20">
                        <div className="border-l-2 border-foreground pl-6 mb-16">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-2 text-foreground">
                                System_Architecture
                            </h2>
                            <p className="text-muted-foreground max-w-2xl text-sm uppercase tracking-wide">
                                // Detailed operational mechanics and data pipeline analysis.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Step 1 */}
                            <div className="space-y-4 group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-2">[ PHASE_01: INGESTION ]</div>
                                <pre className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors leading-none whitespace-pre overflow-x-auto pb-4">
                                    {`
    +-------------+
    |  PDF INPUT  |
    +-----+-------+
          |
    [ ENCRYPTION ]
          |
    +-----v-------+
    | SECURE BUS  |
    +-------------+
`}
                                </pre>
                                <h3 className="text-foreground font-bold uppercase">Document Parsing</h3>
                                <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors leading-relaxed">
                                    The system accepts PDF documents and immediately encrypts the data stream.
                                    Text layers are extracted while preserving spatial coordinates for precise highlighting.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-4 group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-2">[ PHASE_02: ANALYSIS ]</div>
                                <pre className="text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-none whitespace-pre overflow-x-auto pb-4">
                                    {`
    +-------------+
    | GEMINI 2.0  |
    +-----+-------+
          |
   [ CTX WINDOW ]
          |
    +-----v-------+
    |  SEMANTIC   |
    |  MATCHING   |
    +-------------+
`}
                                </pre>
                                <h3 className="text-foreground font-bold uppercase">AI Processing</h3>
                                <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors leading-relaxed">
                                    Google's Gemini 2.0 model scans the content with a 1M+ token context window.
                                    It identifies key concepts, definitions, and actionable insights based on semantic relevance.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="space-y-4 group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-2">[ PHASE_03: OUTPUT ]</div>
                                <pre className="text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-none whitespace-pre overflow-x-auto pb-4">
                                    {`
    +-------------+
    | SYNTHESIS   |
    +-----+-------+
          |
     [ RE-DRAW ]
          |
    +-----v-------+
    | HIGHLIGHTED |
    |     PDF     |
    +-------------+
`}
                                </pre>
                                <h3 className="text-foreground font-bold uppercase">Reconstruction</h3>
                                <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors leading-relaxed">
                                    The document is reconstructed with overlay layers containing the AI-identified highlights.
                                    A side-panel summary is generated for quick navigation.
                                </p>
                            </div>

                            {/* Step 4: Tech Stack or Stats */}
                            <div className="border border-border p-6 hover:bg-muted/10 transition-colors">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">[ SYSTEM_SPECS ]</div>
                                <ul className="space-y-3 text-sm font-mono text-muted-foreground">
                                    <li className="flex justify-between border-b border-border pb-2">
                                        <span>MODEL_VERSION</span>
                                        <span className="text-foreground">GEMINI-1.5-PRO</span>
                                    </li>
                                    <li className="flex justify-between border-b border-border pb-2">
                                        <span>LATENCY</span>
                                        <span className="text-foreground">&lt; 2500ms</span>
                                    </li>
                                    <li className="flex justify-between border-b border-border pb-2">
                                        <span>ENCRYPTION</span>
                                        <span className="text-foreground">AES-256</span>
                                    </li>
                                    <li className="flex justify-between pt-2">
                                        <span>UPTIME</span>
                                        <span className="text-green-500">99.99%</span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                    <div className="w-full max-w-6xl mx-auto px-4 text-left mb-32">
                        <div className="border-l-2 border-foreground pl-6 mb-16">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-2 text-foreground">
                                Core_Capabilities
                            </h2>
                            <p className="text-muted-foreground max-w-2xl text-sm uppercase tracking-wide">
                                // Advanced features powering the next generation of document analysis.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Feature 1 */}
                            <div className="border border-border p-6 hover:bg-muted/10 transition-colors group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-4">[ SEMANTIC_UNDERSTANDING ]</div>
                                <h3 className="text-lg font-bold uppercase mb-2">Context-Aware Analysis</h3>
                                <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                                    Unlike simple keyword search, our AI understands the semantic meaning of your document to highlight what truly matters.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="border border-border p-6 hover:bg-muted/10 transition-colors group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-4">[ RAPID_SYNTHESIS ]</div>
                                <h3 className="text-lg font-bold uppercase mb-2">Instant Summarization</h3>
                                <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                                    Get immediate, high-level summaries of complex technical documents, legal contracts, and academic papers.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="border border-border p-6 hover:bg-muted/10 transition-colors group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-4">[ DIRECT_LINK ]</div>
                                <h3 className="text-lg font-bold uppercase mb-2">Interactive Navigation</h3>
                                <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                                    Click on any summary point to instantly jump to the relevant section in the PDF.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="border border-border p-6 hover:bg-muted/10 transition-colors group">
                                <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest mb-4">[ ZERO_KNOWLEDGE ]</div>
                                <h3 className="text-lg font-bold uppercase mb-2">Secure Processing</h3>
                                <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                                    Your data is encrypted at rest and in transit. We prioritize privacy with a zero-retention policy for processed files.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest">
                        <div>
                            System Status: <span className="text-green-500">ONLINE</span>
                        </div>
                        <div className="flex gap-8">
                            <span className="hover:text-foreground cursor-pointer">[ GITHUB ]</span>
                            <span className="hover:text-foreground cursor-pointer">[ TWITTER ]</span>
                        </div>
                        <div>
                            &copy; 2026 SmartHighlight
                        </div>
                    </div>
                </footer>
            </div >
        </div >
    );
}
