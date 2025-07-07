import { cn } from '@/lib/utils';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { useRecoilValue } from 'recoil';

import { ICommand, commandsState } from '@chainlit/react-client';

import AutoResizeTextarea from '@/components/AutoResizeTextarea';
import Icon from '@/components/Icon';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';

interface Props {
  id?: string;
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
  selectedCommand?: ICommand;
  setSelectedCommand: (command: ICommand | undefined) => void;
  onChange: (value: string) => void;
  onPaste?: (event: any) => void;
  onEnter?: () => void;
}

export interface InputMethods {
  reset: () => void;
}

const Input = forwardRef<InputMethods, Props>(
  (
    {
      placeholder,
      id,
      className,
      autoFocus,
      selectedCommand,
      setSelectedCommand,
      onChange,
      onEnter,
      onPaste
    },
    ref
  ) => {
    const commands = useRecoilValue(commandsState);
    const [isComposing, setIsComposing] = useState(false);
    const [showCommands, setShowCommands] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [commandInput, setCommandInput] = useState('');
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const reset = () => {
      setValue('');
      if (!selectedCommand?.persistent) {
        setSelectedCommand(undefined);
      }
      setSelectedIndex(0);
      setCommandInput('');
      setShowCommands(false);
      onChange('');
    };

    useImperativeHandle(ref, () => ({
      reset
    }));

    useEffect(() => {
      if (textareaRef.current && autoFocus) {
        textareaRef.current.focus();
      }
    }, [autoFocus]);

    const normalizedInput = commandInput.toLowerCase().slice(1);

    const filteredCommands = commands
      .filter((command) => command.id.toLowerCase().includes(normalizedInput))
      .sort((a, b) => {
        const indexA = a.id.toLowerCase().indexOf(normalizedInput);
        const indexB = b.id.toLowerCase().indexOf(normalizedInput);
        return indexA - indexB;
      });

    useEffect(() => {
      // Reset selected index when filtered commands change
      setSelectedIndex(0);
    }, [filteredCommands.length]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange(newValue);

      // Command detection for dropdown
      const words = newValue.split(' ');
      if (words.length === 1 && words[0].startsWith('/')) {
        setShowCommands(true);
        setCommandInput(words[0]);
      } else {
        setShowCommands(false);
        setCommandInput('');
      }
    };

    const handleCommandSelect = (command: ICommand) => {
      setShowCommands(false);
      setSelectedCommand(command);
      
      // Remove the command text from the input
      const newValue = value.replace(commandInput, '').trimStart();
      setValue(newValue);
      onChange(newValue);
      
      setSelectedIndex(0);
      setCommandInput('');
      
      // Focus back on textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle command selection - check this FIRST before other key handling
      if (showCommands && filteredCommands.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            e.stopPropagation();
            setSelectedIndex((prev) =>
              prev < filteredCommands.length - 1 ? prev + 1 : 0
            );
            return;
          
          case 'ArrowUp':
            e.preventDefault();
            e.stopPropagation();
            setSelectedIndex((prev) => 
              prev > 0 ? prev - 1 : filteredCommands.length - 1
            );
            return;
          
          case 'Enter':
            e.preventDefault();
            e.stopPropagation();
            const selectedCmd = filteredCommands[selectedIndex];
            if (selectedCmd) {
              handleCommandSelect(selectedCmd);
            }
            return;
          
          case 'Escape':
            e.preventDefault();
            e.stopPropagation();
            setShowCommands(false);
            setCommandInput('');
            setSelectedIndex(0);
            return;
          
          case 'Tab':
            e.preventDefault();
            e.stopPropagation();
            const tabCmd = filteredCommands[selectedIndex];
            if (tabCmd) {
              handleCommandSelect(tabCmd);
            }
            return;
        }
      }

      // Handle regular enter only if command menu is not showing
      if (e.key === 'Enter' && !e.shiftKey && onEnter && !isComposing && !showCommands) {
        e.preventDefault();
        onEnter();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (onPaste) {
        onPaste(e);
      }
    };

    return (
      <div className="relative w-full">
        <AutoResizeTextarea
          ref={textareaRef}
          id={id}
          autoFocus={autoFocus}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          className={cn(
            'w-full resize-none bg-transparent placeholder:text-muted-foreground focus:outline-none',
            className
          )}
          maxHeight={250}
        />

        {showCommands && filteredCommands.length > 0 && (
          <div className="absolute z-50 -top-4 left-0 -translate-y-full">
            <Command className="rounded-lg border shadow-md bg-background">
              <CommandList>
                <CommandGroup>
                  {filteredCommands.map((command, index) => (
                    <CommandItem
                      key={command.id}
                      onSelect={() => handleCommandSelect(command)}
                      className={cn(
                        'cursor-pointer command-item flex items-center space-x-2 p-2',
                        index === selectedIndex && 'bg-accent'
                      )}
                      aria-selected={index === selectedIndex}
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
          </div>
        )}
      </div>
    );
  }
);

export default Input;
