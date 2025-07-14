import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { every } from 'lodash';
import { Settings2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ICommand, commandsState } from '@chainlit/react-client';

import Icon from '@/components/Icon';
import { Button } from '@/components/ui/button';

interface Props {
  disabled?: boolean;
  selectedCommandId?: string;
  onCommandSelect: (command: ICommand) => void;
}

export const CommandPopoverButton = ({
  disabled = false,
  selectedCommandId,
  onCommandSelect
}: Props) => {
  const commands = useRecoilValue(commandsState);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastMouseMove, setLastMouseMove] = useState(0);
  const commandListRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allButtons = every(commands.map((c) => !!c.button));

  // Check if there's a selected non-button command
  const hasSelectedNonButtonCommand = commands.some(
    c => c.id === selectedCommandId && !c.button
  );

  const nonButtonCommands = commands.filter(c => !c.button);

  // Handle animation when selection changes
  useEffect(() => {
    if (hasSelectedNonButtonCommand) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [hasSelectedNonButtonCommand]);

  // Reset selected index when opening/closing
  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setLastMouseMove(0);
      // Focus the popover content after a short delay to ensure it's rendered
      setTimeout(() => {
        const popoverContent = document.querySelector('[data-popover-content]');
        if (popoverContent instanceof HTMLElement) {
          popoverContent.focus();
        }
      }, 50);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (open && commandListRef.current) {
      const selectedElement = commandListRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, open]);

  const handleMouseMove = (index: number) => {
    const now = Date.now();
    // Only update if mouse actually moved (not just from render)
    if (now - lastMouseMove > 50) {
      setSelectedIndex(index);
      setLastMouseMove(now);
    }
  };

  const handleMouseLeave = () => {
    // Keep the last hovered item selected when mouse leaves
    setLastMouseMove(Date.now());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || nonButtonCommands.length === 0) return;

    // Check if mouse was recently moved
    const timeSinceMouseMove = Date.now() - lastMouseMove;
    const isUsingKeyboard = timeSinceMouseMove > 100;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (isUsingKeyboard) {
          setSelectedIndex((prev) => 
            prev < nonButtonCommands.length - 1 ? prev + 1 : 0
          );
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (isUsingKeyboard) {
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : nonButtonCommands.length - 1
          );
        }
        break;
      
      case 'Enter': {
        e.preventDefault();
        e.stopPropagation();
        const selectedCmd = nonButtonCommands[selectedIndex];
        if (selectedCmd) {
          onCommandSelect(selectedCmd);
          setOpen(false);
        }
        break;
      }
      
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        break;
    }
  };

  const handleCommandSelect = (command: ICommand) => {
    onCommandSelect(command);
    setOpen(false);
  };

  if (!commands.length || allButtons) return null;

  return (
    <div className={cn(
      "command-popover-wrapper",
      "transition-all duration-300 ease-out",
      isAnimating && "animate-command-shift"
    )}>
      <style>{`
        @keyframes command-shift {
          0% { transform: translateX(-10px); opacity: 0.8; }
          50% { transform: translateX(5px); }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .animate-command-shift {
          animation: command-shift 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .command-list-container::-webkit-scrollbar {
          width: 4px;
        }
        
        .command-list-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .command-list-container::-webkit-scrollbar-thumb {
          background-color: hsl(var(--muted-foreground) / 0.3);
          border-radius: 2px;
        }
        
        .command-list-container {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
        }
      `}</style>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            id="command-button"
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-full font-medium text-[13px]",
              "hover:bg-muted hover:dark:bg-muted transition-all duration-200",
              "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              open && "bg-muted/50",
              !hasSelectedNonButtonCommand && "command-button-expanded"
            )}
            disabled={disabled}
            style={{
              transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Settings2 className="!size-5 transition-transform duration-200" />
            <span 
              className={cn(
                "overflow-hidden transition-all duration-300",
                hasSelectedNonButtonCommand ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
              style={{
                maxWidth: hasSelectedNonButtonCommand ? '0' : '100px'
              }}
            >
              Tools
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={12}
          className="focus:outline-none p-2 rounded-lg border shadow-md bg-background animate-in fade-in-0 zoom-in-95 duration-200"
          onKeyDown={handleKeyDown}
          onMouseLeave={handleMouseLeave}
          data-popover-content
          tabIndex={-1}
        >
          <div 
            ref={commandListRef} 
            className={cn(
              "command-list-container",
              nonButtonCommands.length > 5 ? "max-h-[300px] overflow-y-auto" : "max-h-none overflow-visible"
            )}
          >
            {nonButtonCommands.map((command, index) => (
              <div
                key={command.id}
                data-index={index}
                onMouseMove={() => handleMouseMove(index)}
                onClick={() => handleCommandSelect(command)}
                className={cn(
                  'cursor-pointer flex items-center space-x-2 p-2 rounded-md',
                  'transition-all duration-150',
                  'hover:scale-[1.02]',
                  index === selectedIndex && 'bg-accent text-accent-foreground scale-[1.02]'
                )}
              >
                <Icon
                  name={command.icon}
                  className="!size-5 text-muted-foreground transition-transform duration-150"
                />
                <div>
                  <div className="font-medium">{command.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {command.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CommandPopoverButton;
