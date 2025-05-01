import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function PersonalInfo({ formRef, onSuccess }) {
  const { id } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      resume: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/${id}/getprofile`);
        const profileData = response.data;
        
        if (profileData.personalInfo) {
          setIsSubmitted(true);
          form.reset({
            firstName: profileData.personalInfo.firstName,
            lastName: profileData.personalInfo.lastName,
            email: profileData.personalInfo.email,
            phone: profileData.personalInfo.phone,
            dateOfBirth: profileData.personalInfo.dateOfBirth?.split('T')[0] || "",
            address: {
              street: profileData.personalInfo.address?.street || "",
              city: profileData.personalInfo.address?.city || "",
              state: profileData.personalInfo.address?.state || "",
              zip: profileData.personalInfo.address?.zip || "",
            },
            resume: profileData.personalInfo.resume || "",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (id) fetchProfile();
  }, [id, form]);

  const onSubmit = async (formData) => {
    try {
      const response = await axios.post(`http://localhost:3000/api/v1/${id}/profile`, formData);
      
      if (response.status === 200) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred. Please try again.';
      form.setError('root', { type: 'manual', message: errorMessage });
    }
  };

  return (
    <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
      {isSubmitted ? (
        <div className="space-y-4 text-lg">
          <p><strong>Name:</strong> {form.watch("firstName")} {form.watch("lastName")}</p>
          <p><strong>Email:</strong> {form.watch("email")}</p>
          <p><strong>Phone:</strong> {form.watch("phone")}</p>
          <p><strong>Date of Birth:</strong> {form.watch("dateOfBirth")}</p>
          <p><strong>Address:</strong> {form.watch("address.street")}, {form.watch("address.city")}, {form.watch("address.state")} {form.watch("address.zip")}</p>
          <p><strong>Resume:</strong> {form.watch("resume") ? "Uploaded" : "Not Uploaded"}</p>
          <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
        </div>
      ) : (
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              {["street", "city", "state", "zip"].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={`address.${fieldName}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField control={form.control} name="resume" render={({ field }) => (
              <FormItem>
                <FormLabel>Resume (Drive Link)</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

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

export default PersonalInfo;