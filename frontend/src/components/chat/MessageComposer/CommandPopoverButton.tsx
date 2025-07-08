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
  const commandListRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allButtons = every(commands.map((c) => !!c.button));

  // Check if there's a selected non-button command
  const hasSelectedNonButtonCommand = commands.some(
    c => c.id === selectedCommandId && !c.button
  );

  const nonButtonCommands = commands.filter(c => !c.button);

  // Reset selected index when opening/closing
  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
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
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || nonButtonCommands.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => 
          prev < nonButtonCommands.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : nonButtonCommands.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        const selectedCmd = nonButtonCommands[selectedIndex];
        if (selectedCmd) {
          onCommandSelect(selectedCmd);
          setOpen(false);
        }
        break;
      
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          id="command-button"
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 rounded-full font-medium text-[13px]",
            "hover:bg-muted/30 transition-colors",
            "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            open && "bg-muted/50"
          )}
          disabled={disabled}
        >
          <Settings2 className="!size-5" />
          {!hasSelectedNonButtonCommand && (
            <span>Tools</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={12}
        className="focus:outline-none p-2 rounded-lg border shadow-md bg-background"
        onKeyDown={handleKeyDown}
        data-popover-content
        tabIndex={-1}
      >
        <div ref={commandListRef} className="max-h-[300px] overflow-y-auto">
          {nonButtonCommands.map((command, index) => (
            <div
              key={command.id}
              data-index={index}
              onClick={() => handleCommandSelect(command)}
              className={cn(
                'cursor-pointer flex items-center space-x-2 p-2 rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                index === selectedIndex && 'bg-accent text-accent-foreground'
              )}
            >
              <Icon
                name={command.icon}
                className="!size-5 text-muted-foreground"
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
  );
};

export default CommandPopoverButton;
