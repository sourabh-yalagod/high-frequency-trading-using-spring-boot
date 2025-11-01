import {
    Apple,
    Facebook,
    Goal,
    Linkedin,
    MessageCircle,
    Twitter,
} from "lucide-react";

// components/FooterSection.jsx
const FooterSection = ({ title, items }: any) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ul className="space-y-2 text-sm">
                {items.map((item: any, index: number) => (
                    <li key={index}>
                        <a href={item.href} className="transition-colors duration-200">
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className="pt-12 px-6 md:px-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 border-b border-gray-700 pb-10">
                {/* Brand */}
                <div className="col-span-2">
                    <h1 className="text-2xl font-bold mb-3">CryptoX</h1>
                    <p className="text-sm leading-relaxed ">
                        CryptoX is a secure and efficient digital asset exchange platform
                        built for both beginners and professionals. Trade with confidence.
                    </p>

                    {/* Social Icons */}
                    <div className="flex space-x-4 mt-4">
                        <Twitter className="hover:scale-105 cursor-pointer transition" />
                        <MessageCircle className="hover:scale-105 cursor-pointer transition" />
                        <Linkedin className="hover:scale-105 cursor-pointer transition" />
                        <Facebook className="hover:scale-105 cursor-pointer transition" />
                    </div>
                </div>

                {/* Sections */}
                <FooterSection
                    title="Exchange"
                    items={[
                        { label: "Markets", href: "/markets" },
                        { label: "Trading Fees", href: "/fees" },
                        { label: "API Access", href: "/api" },
                        { label: "Mobile App", href: "/app" },
                    ]}
                />
                <FooterSection
                    title="Support"
                    items={[
                        { label: "Help Center", href: "/help" },
                        { label: "Security", href: "/security" },
                        { label: "Contact Us", href: "/contact" },
                        { label: "Submit a Ticket", href: "/ticket" },
                    ]}
                />
                <FooterSection
                    title="Legal"
                    items={[
                        { label: "Privacy Policy", href: "/privacy" },
                        { label: "Terms of Service", href: "/terms" },
                        { label: "AML Policy", href: "/aml" },
                        { label: "Cookies", href: "/cookies" },
                    ]}
                />
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm pt-6 pb-4">
                <p>
                    © {new Date().getFullYear()} CryptoX Exchange. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                    <a
                        href="/app-store"
                        className="flex items-center gap-1 hover:scale-105 cursor-pointer"
                    >
                        <Apple /> iOS App
                    </a>
                    <a
                        href="/play-store"
                        className="flex items-center gap-1 hover:scale-105 cursor-pointer"
                    >
                        <Goal /> Android App
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
