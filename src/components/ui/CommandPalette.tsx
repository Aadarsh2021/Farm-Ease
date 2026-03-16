import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Home, LayoutDashboard, ShoppingBag, Info, Command, CornerDownLeft } from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  category: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    {
      id: "home",
      title: "Index",
      description: "Return to the central terminal",
      icon: Home,
      category: "System",
      action: () => navigate("/"),
    },
    {
      id: "market",
      title: "Marketplace",
      description: "Access the global asset exchange",
      icon: ShoppingBag,
      category: "Navigation",
      action: () => navigate("/market"),
    },
    {
      id: "dashboard",
      title: "Dashboard",
      description: "Enter your personal command center",
      icon: LayoutDashboard,
      category: "Navigation",
      action: () => navigate("/dashboard"),
    },
    {
      id: "about",
      title: "Manifesto",
      description: "Learn about the Farm-Ease protocol",
      icon: Info,
      category: "Platform",
      action: () => navigate("/about"),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleOpenEvent);
    
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  const handleSelect = useCallback((cmd: CommandItem) => {
    cmd.action();
    setIsOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (filteredCommands.length > 0 && selectedIndex >= filteredCommands.length) {
      setSelectedIndex(0);
    }
  }, [filteredCommands, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, handleSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[hsl(var(--foreground))]/60 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[hsl(var(--foreground))] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <Search className="text-[hsl(var(--primary))] opacity-50" size={20} />
              <input
                autoFocus
                placeholder="Search protocol assets & commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white text-lg font-medium placeholder:text-white/20"
              />
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">ESC</span>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
              {filteredCommands.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-white/30 text-sm font-medium">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Categorized results could go here */}
                  <div className="space-y-2">
                    {filteredCommands.map((cmd, idx) => (
                      <div
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                          group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200
                          ${idx === selectedIndex ? 'bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] shadow-glow shadow-primary/20 scale-[1.02]' : 'hover:bg-white/5 text-white/60'}
                        `}
                      >
                        <div className={`
                          p-2.5 rounded-xl transition-colors
                          ${idx === selectedIndex ? 'bg-black/10' : 'bg-white/5 group-hover:bg-white/10'}
                        `}>
                          <cmd.icon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-xs uppercase tracking-widest">{cmd.title}</h4>
                            <span className={`text-[9px] font-black uppercase tracking-widest opacity-40 ${idx === selectedIndex ? 'text-black' : 'text-white'}`}>
                              • {cmd.category}
                            </span>
                          </div>
                          <p className={`text-[10px] font-medium leading-relaxed mt-1 ${idx === selectedIndex ? 'text-black/60' : 'text-white/30'}`}>
                            {cmd.description}
                          </p>
                        </div>
                        {idx === selectedIndex && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-black/10 rounded-lg"
                          >
                            <span className="text-[8px] font-black uppercase tracking-widest">Execute</span>
                            <CornerDownLeft size={12} strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-white/5 rounded border border-white/10">
                    <Command size={10} className="text-white/40" />
                  </div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">K to Open</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Farm-Ease Intelligence v2.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
