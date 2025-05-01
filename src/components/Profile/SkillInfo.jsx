import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const suggestedSkills = [
    "JavaScript", "React", "Node.js", "Python", "Django", "Flask",
    "FastAPI", "TypeScript", "MongoDB", "PostgreSQL", "Docker",
    "Kubernetes", "GraphQL", "Next.js", "Express.js", "Firebase",
    "TensorFlow", "PyTorch", "Solidity", "Ethereum"
];

function SkillInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: { skills: [] },
    });

    useEffect(() => {
        const fetchSkills = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.skills && profileData.skills.length > 0) {
                    setIsSubmitted(true);
                    form.reset({ skills: profileData.skills });
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch skills');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchSkills();
    }, [id, form]);

    const onSubmit = async () => {
        const skills = form.getValues("skills");
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/skills`, { skills });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update skills';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const handleAddSkill = (event) => {
        if (event.key === "Enter" && event.target.value.trim() !== "") {
            event.preventDefault();
            const newSkill = event.target.value.trim();
            const currentSkills = form.getValues("skills");
            if (!currentSkills.includes(newSkill)) {
                const updatedSkills = [...currentSkills, newSkill];
                form.setValue("skills", updatedSkills);
            }
            event.target.value = "";
        }
    };

    const handleRemoveSkill = (skill) => {
        const currentSkills = form.getValues("skills");
        const updatedSkills = currentSkills.filter((s) => s !== skill);
        form.setValue("skills", updatedSkills);
    };

    const handleSuggestedSkillClick = (skill) => {
        const currentSkills = form.getValues("skills");
        if (!currentSkills.includes(skill)) {
            const updatedSkills = [...currentSkills, skill];
            form.setValue("skills", updatedSkills);
        }
    };

    if (isLoading) {
        return (
            <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </Card>
        );
    }

    if (fetchError) {
        return (
            <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
                <div className="text-red-500">{fetchError}</div>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Card>
        );
    }

    const currentSkills = form.watch("skills") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {currentSkills.map((skill, index) => (
                            <Badge key={index} className="px-3 py-1">{skill}</Badge>
                        ))}
                    </div>
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="skills"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Enter Skills</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Type a skill and press Enter"
                                            onKeyDown={handleAddSkill}
                                        />
                                    </FormControl>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {currentSkills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                className="cursor-pointer px-3 py-1"
                                                onClick={() => handleRemoveSkill(skill)}
                                            >
                                                {skill} ✕
                                            </Badge>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Common Skills</h3>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {suggestedSkills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="cursor-pointer px-3 py-1"
                                        onClick={() => handleSuggestedSkillClick(skill)}
                                    >
                                        + {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {form.formState.errors.root && (
                            <p className="text-red-500">{form.formState.errors.root.message}</p>
                        )}

                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            )}
        </Card>
    );
}

export default SkillInfo;