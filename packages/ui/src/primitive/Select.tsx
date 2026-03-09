import { createEffect, createSignal, For, onMount, type Accessor } from "solid-js";
import { styled } from "solid-styled-components";

const SelectContainer = styled.div`
  position: relative;
  /* width: 200px; */
  width: 100%;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--border-color-light);
    background: var(--bg-select-active);
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
    border-color: var(--border-focus);
  }
`;

const Arrow = styled.span<{ isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? "rotate(180deg)" : "rotate(0deg)"};
  display: inline-block;
`;

const DropdownMenu = styled.div<{ isOpen: boolean; openUpward: boolean }>`
  position: absolute;
  ${props => props.openUpward ? "bottom: calc(100% + 0.25rem);" : "top: calc(100% + 0.25rem);"}
  left: 0;
  right: 0;
  background: var(--bg-select-active);
  border: 1px solid var(--border-color-light);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  opacity: ${props => props.isOpen ? "1" : "0"};
  visibility: ${props => props.isOpen ? "visible" : "hidden"};
  transform: ${props => props.isOpen ? "translateY(0)" : props.openUpward ? "translateY(10px)" : "translateY(-10px)"};
  transition: all 0.2s ease;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border-radius: 0.5rem;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 0.5rem;
    
    &:hover {
      background: var(--scrollbar-thumb-hover);
    }
  }
`;

const Option = styled.div<{ isSelected: boolean }>`
  padding: 0.75rem 1rem;
  user-select: none;
  color: ${props => props.isSelected ? "white" : "var(--text-primary)"};
  background: ${props => props.isSelected ? "var(--primary-color)" : "transparent"};
  transition: background-color 0.15s ease, color 0.15s ease;
  
  &:hover {
    background: ${props => props.isSelected ? "var(--primary-hover)" : "var(--bg-hover)"};
    color: ${props => props.isSelected ? "white" : "var(--text-secondary)"};
  }
  
  &:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  
  &:last-child {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
`;

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: Accessor<T> | T;
  onChange: (value: T) => void;
  placeholder?: string;
}

export const Select = <T extends string>(props: SelectProps<T>) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [openUpward, setOpenUpward] = createSignal(false);
  const currentValue = () => typeof props.value === "function" ? props.value() : props.value;
  const selectedOption = () => props.options.find(opt => opt.value === currentValue());
  const handleSelect = (value: T) => {
    props.onChange(value);
    setIsOpen(false);
  };
  const handleToggle = () => {
    // setTimeout(() => setIsOpen(!isOpen()), 20);
    setIsOpen(!isOpen());
  };
  
  const handleClickOutside = (e: MouseEvent, t: HTMLElement) => {
    const target = e.target as HTMLElement;
    if (!target.isEqualNode(t) && !t.contains(target)) {
      setIsOpen(false);
    }
  };
  
  let containerRef!: HTMLDivElement;
  let dropdownRef!: HTMLDivElement;
  onMount(() => {
    
      const rect = containerRef.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // calc approx height of dropdown
      const dropdownHeight = props.options.length * 48;
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
  });
  
  createEffect(()  => {
    if (isOpen()) {
      const rect = containerRef.getBoundingClientRect();
      const dropdownRect = dropdownRef.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = dropdownRect.height;
      
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
      document.addEventListener("click", (e) => handleClickOutside(e, containerRef));
    } else {
      document.removeEventListener("click",  (e) => handleClickOutside(e, containerRef));
    }
  });
  
  return (
    <SelectContainer data-select-container ref={containerRef}>
      <SelectButton onClick={handleToggle} type="button">
        <span>{selectedOption()?.label || props.placeholder || "Select..."}</span>
        <Arrow isOpen={isOpen()}>▼</Arrow>
      </SelectButton>
      <DropdownMenu isOpen={isOpen()} openUpward={openUpward()} ref={dropdownRef}>
        <For each={props.options}>
          {(option) => (
            <Option
              isSelected={option.value === currentValue()}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </Option>
          )}
        </For>
      </DropdownMenu>
    </SelectContainer>
  );
};
