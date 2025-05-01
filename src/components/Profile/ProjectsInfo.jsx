import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";

function ProjectsInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            projects: [{
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                technologiesUsed: [],
                projectLink: "",
                isOpenSource: false,
            }]
        }
    });

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.projects && profileData.projects.length > 0) {
                    setIsSubmitted(true);
                    // Format dates for input fields
                    const formattedProjects = profileData.projects.map(project => ({
                        ...project,
                        startDate: project.startDate?.split('T')[0] || "",
                        endDate: project.endDate?.split('T')[0] || ""
                    }));
                    form.reset({ projects: formattedProjects });
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch projects');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchProjects();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/projects`, {
                projects: data.projects
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update projects';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const addProject = () => {
        const currentProjects = form.getValues("projects");
        form.setValue("projects", [
            ...currentProjects,
            {
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                technologiesUsed: [],
                projectLink: "",
                isOpenSource: false,
            }
        ]);
    };

    const removeProject = (index) => {
        const currentProjects = form.getValues("projects");
        const updatedProjects = currentProjects.filter((_, i) => i !== index);
        form.setValue("projects", updatedProjects);
    };

    const handleAddTech = (index, event) => {
        if (event.key === "Enter" && event.target.value.trim() !== "") {
            event.preventDefault();
            const newTech = event.target.value.trim();
            const currentProjects = form.getValues("projects");
            const updatedProjects = [...currentProjects];
            updatedProjects[index].technologiesUsed = [...updatedProjects[index].technologiesUsed, newTech];
            form.setValue("projects", updatedProjects);
            event.target.value = "";
        }
    };

    const handleRemoveTech = (index, tech) => {
        const currentProjects = form.getValues("projects");
        const updatedProjects = [...currentProjects];
        updatedProjects[index].technologiesUsed = updatedProjects[index].technologiesUsed.filter(t => t !== tech);
        form.setValue("projects", updatedProjects);
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

    const currentProjects = form.watch("projects") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Projects</h2>
                    {currentProjects.map((project, index) => (
                        <div key={index} className="border p-3 rounded-lg space-y-2">
                            <p><strong>Title:</strong> {project.title}</p>
                            <p><strong>Description:</strong> {project.description}</p>
                            <p><strong>Start Date:</strong> {project.startDate}</p>
                            <p><strong>End Date:</strong> {project.endDate || 'Present'}</p>
                            <div className="flex flex-wrap gap-1">
                                <strong>Technologies:</strong>
                                {project.technologiesUsed.map((tech, i) => (
                                    <Badge key={i} variant="secondary">{tech}</Badge>
                                ))}
                            </div>
                            <p>
                                <strong>Project Link:</strong> 
                                {project.projectLink ? (
                                    <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">
                                        View Project
                                    </a>
                                ) : 'Not provided'}
                            </p>
                            <p><strong>Open Source:</strong> {project.isOpenSource ? 'Yes' : 'No'}</p>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {currentProjects.map((project, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                <button 
                                    type="button" 
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                    onClick={() => removeProject(index)}
                                    disabled={currentProjects.length <= 1}
                                >
                                    <X size={20} />
                                </button>

                                <h3 className="text-lg font-semibold">Project {index + 1}</h3>

                                {["title", "startDate", "endDate", "projectLink"].map((fieldName) => (
                                    <FormField
                                        key={fieldName}
                                        control={form.control}
                                        name={`projects.${index}.${fieldName}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {fieldName.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type={fieldName.includes("Date") ? "date" : "text"} 
                                                        required={fieldName !== "endDate" && fieldName !== "projectLink"}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField
                                    control={form.control}
                                    name={`projects.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} required />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>Technologies Used</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Type a technology and press Enter"
                                            onKeyDown={(e) => handleAddTech(index, e)}
                                        />
                                    </FormControl>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {project.technologiesUsed.map((tech, i) => (
                                            <Badge
                                                key={i}
                                                className="cursor-pointer"
                                                onClick={() => handleRemoveTech(index, tech)}
                                            >
                                                {tech} ✕
                                            </Badge>
                                        ))}
                                    </div>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name={`projects.${index}.isOpenSource`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel>Is Open Source?</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={addProject}>
                                Add Another Project
                            </Button>
                            <Button type="submit">Save Projects</Button>
                        </div>

                        {form.formState.errors.root && (
                            <p className="text-red-500">{form.formState.errors.root.message}</p>
                        )}
                    </form>
                </Form>
            )}
        </Card>
    );
}

export default ProjectsInfo;