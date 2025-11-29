import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

interface AccordionItemProps {
  children: React.ReactNode
  className?: string
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isOpen?: boolean
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}

function Accordion({ children, className }: AccordionProps) {
  return <div className={cn('w-full', className)}>{children}</div>
}

function AccordionItem({ children, className }: AccordionItemProps) {
  return <div className={cn('border-b', className)}>{children}</div>
}

function AccordionTrigger({
  children,
  className,
  onClick,
  isOpen = false,
}: AccordionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between py-1 text-sm font-medium transition-all hover:underline',
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}

function AccordionContent({
  children,
  className,
  isOpen = false,
}: AccordionContentProps) {
  return (
    <div
      className={cn(
        'overflow-hidden text-sm transition-all',
        isOpen ? 'block' : 'hidden'
      )}
    >
      <div className={cn('pb-2 pt-0', className)}>{children}</div>
    </div>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }

