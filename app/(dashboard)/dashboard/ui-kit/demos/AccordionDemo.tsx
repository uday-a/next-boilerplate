'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern for accordions.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Can I customize styles?</AccordionTrigger>
        <AccordionContent>Absolutely. All components are built with Tailwind and expose class props.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it SSR-friendly?</AccordionTrigger>
        <AccordionContent>Yes. Components work with Next.js SSR and hydration.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
