import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useRecoilValue } from 'recoil';

import { ICommand, commandsState } from '@chainlit/react-client';

import Icon from '@/components/Icon';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface Props {
  disabled?: boolean;
  selectedCommandId?: string;
  onCommandSelect: (command?: ICommand) => void;
}

export const CommandButtons = ({
  disabled = false,
  selectedCommandId,
  onCommandSelect
}: Props) => {
  const commands = useRecoilValue(commandsState);
  const commandButtons = commands.filter((c) => !!c.button);
  
  // Find the selected command if it's not a button command
  const selectedCommand = commands.find(c => c.id === selectedCommandId && !c.button);
  
  // If no button commands and no selected non-button command, don't render
  if (!commandButtons.length && !selectedCommand) return null;

  return (
    <div className="flex gap-1 ml-1 flex-wrap">
      <TooltipProvider>
        {/* Show selected non-button command as a button */}
        {selectedCommand && (
          <Tooltip key={selectedCommand.id}>
            <TooltipTrigger asChild>
              <Button
                id={`command-${selectedCommand.id}`}
                variant="ghost"
                disabled={disabled}
                className="p-2 h-9 text-[13px] font-medium rounded-full group hover:bg-[#E8F2FF] hover:dark:bg-[#1A3A52] transition-colors"
                onClick={() => onCommandSelect(undefined)}
              >
                <Icon name={selectedCommand.icon} className="!h-5 !w-5 text-[#0066FF]" />
                <span className="text-[#0066FF] max-w-full overflow-visible text-clip whitespace-normal">
                  {selectedCommand.id}
                </span>
                <X className="!size-4 ml-1 text-[#0066FF] opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to remove {selectedCommand.id}</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Show button commands */}
        {commandButtons.map((command) => (
          <Tooltip key={command.id}>
            <TooltipTrigger asChild>
              <Button
                id={`command-${command.id}`}
                variant="ghost"
                disabled={disabled}
                className={cn(
                  'p-2 h-9 text-[13px] font-medium rounded-full hover:bg-[#E8F2FF] hover:dark:bg-[#1A3A52] transition-colors group',
                  selectedCommandId === command.id && 'text-[#0066FF]'
                )}
                onClick={() =>
                  selectedCommandId === command.id
                    ? onCommandSelect(undefined)
                    : onCommandSelect(command)
                }
              >
                <Icon 
                  name={command.icon} 
                  className={cn(
                    "!h-5 !w-5",
                    selectedCommandId === command.id && "text-[#0066FF]"
                  )} 
                />
                <span
                  className={cn(
                    selectedCommandId === command.id
                      ? 'max-w-full overflow-visible text-clip whitespace-normal'
                      : 'max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap max-sm:hidden'
                  )}
                >
                  {command.id}
                </span>
                {selectedCommandId === command.id && (
                  <X className="!size-4 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{command.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default CommandButtons;
