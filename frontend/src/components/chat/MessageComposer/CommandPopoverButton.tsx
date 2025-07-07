import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { every } from 'lodash';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { ICommand, commandsState } from '@chainlit/react-client';

import Icon from '@/components/Icon';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';

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
  const allButtons = every(commands.map((c) => !!c.button));

  // Check if there's a selected non-button command
  const hasSelectedNonButtonCommand = commands.some(
    c => c.id === selectedCommandId && !c.button
  );

  if (!commands.length || allButtons) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="command-button"
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 rounded-full font-medium text-[13px]",
            "hover:bg-muted/50 transition-colors",
            open && "bg-muted/70"
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
        className="focus:outline-none"
      >
        <Command className="rounded-lg border shadow-md bg-background">
          <CommandList>
            <CommandGroup>
              {commands.filter(c => !c.button).map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => {
                    onCommandSelect(command);
                    setOpen(false);
                  }}
                  className="command-item cursor-pointer flex items-center space-x-2 p-2"
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CommandPopoverButton;
