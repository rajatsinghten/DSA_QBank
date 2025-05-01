import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion"

function AccordionDemo() {
    return (
        <Accordion type="single" collapsible className="w-full px-4 md:px-8 py-10 md:py-20">
            <div className="py-4 mb-4 flex flex-col items-center">
                <h2 className="text-3xl md:text-5xl font-bold"> Frequently Asked <span className='text-green-500'>Questions</span></h2>
            </div>
            <AccordionItem value="item-1">
                <AccordionTrigger>How does Uply create tailored resumes and cover letters?</AccordionTrigger>
                <AccordionContent>
                Uply uses AI to analyze your profile and the job description, selecting the most relevant projects, skills, and experiences to craft professional resumes and cover letters.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I customize what information is included in my portfolio?</AccordionTrigger>
                <AccordionContent>
                Yes! Uply&apos;s portfolio API allows you to control what data gets reflected, giving you full flexibility and personalization.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>What types of interview questions does Uply provide?</AccordionTrigger>
                <AccordionContent>
                Uply provides job-specific DSA questions, technical interview questions, and behavioral questions curated using AI and real-world trends.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger>Is my data secure with Uply?</AccordionTrigger>
                <AccordionContent>
                Absolutely! We prioritize your data privacy and security, ensuring all personal information is stored and managed with top-notch encryption protocols.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>How quickly can I create a resume for a job posting?</AccordionTrigger>
                <AccordionContent>
                With Uply, you can create a fully tailored resume and cover letter in just 1-2 minutes by simply pasting the job title, description, and company name!
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
};

export default AccordionDemo;