import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, Landmark, Hospital, MapPin, LocateFixed } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  admin_name: z.string()
    .min(3, "Full Name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
  admin_email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.string(),
  current_location: z.string().min(3, "Location is required"),
  current_location_lat: z.string().optional(),
  current_location_lng: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

const AdminRegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      admin_name: '',
      admin_email: '',
      password: '',
      confirmPassword: '',
      role: 'education_admin',
      current_location: '',
      current_location_lat: '',
      current_location_lng: '',
    },
  });

  const handleRoleChange = (value: string) => {
    form.setValue('role', value);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Location not supported",
        description: "Your browser does not support geolocation.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim (Free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            // Get a cleaner version of the address (e.g. City, Region, Country)
            const address = data.address;
            const city = address.city || address.town || address.village || address.suburb || "";
            const state = address.state || "";
            const country = address.country || "";
            
            const readableAddress = [city, state, country].filter(Boolean).join(", ");
            form.setValue('current_location', readableAddress || data.display_name);
          } else {
            form.setValue('current_location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
          
          form.setValue('current_location_lat', String(lat));
          form.setValue('current_location_lng', String(lng));
          
          toast({
            title: "Location captured",
            description: "Current address detected successfully.",
          });
        } catch (error) {
          console.error("Geocoding error:", error);
          form.setValue('current_location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          form.setValue('current_location_lat', String(lat));
          form.setValue('current_location_lng', String(lng));
          toast({
            title: "Location captured",
            description: "Coordinates added (address lookup failed).",
          });
        }
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location access denied",
          description: "Please allow location access or enter it manually.",
        });
      }
    );
  };

  const getEntityType = (role: string) => {
    if (role === 'education_admin') return 'university';
    if (role === 'scheme_admin') return 'scheme';
    if (role === 'hospital_admin') return 'hospital';
    return 'university';
  };

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_name: values.admin_name,
          admin_email: values.admin_email,
          password: values.password,
          role: values.role,
          current_location: values.current_location,
          current_location_lat: values.current_location_lat,
          current_location_lng: values.current_location_lng,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Registration error",
          description: data.message || "Something went wrong",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Step 1 complete. Now tell us about your institution.",
        });
        
        const entityType = getEntityType(values.role);
        navigate(`/admin/onboarding?adminId=${data.data._id}&type=${entityType}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An error occurred during registration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Registration</CardTitle>
          <CardDescription>
            Join Awam Assist as an institutional partner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-center block font-semibold text-slate-700">Select Your Entity Type</Label>
              <RadioGroup 
                defaultValue="education_admin" 
                onValueChange={handleRoleChange}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="education_admin" id="education" className="peer sr-only" />
                  <Label
                    htmlFor="education"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:bg-primary-50 cursor-pointer transition-all"
                  >
                    <GraduationCap className="mb-3 h-6 w-6 text-slate-600 peer-data-[state=checked]:text-primary-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">University</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="scheme_admin" id="scheme" className="peer sr-only" />
                  <Label
                    htmlFor="scheme"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:bg-primary-50 cursor-pointer transition-all"
                  >
                    <Landmark className="mb-3 h-6 w-6 text-slate-600 peer-data-[state=checked]:text-primary-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scheme</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="hospital_admin" id="hospital" className="peer sr-only" />
                  <Label
                    htmlFor="hospital"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:bg-primary-50 cursor-pointer transition-all"
                  >
                    <Hospital className="mb-3 h-6 w-6 text-slate-600 peer-data-[state=checked]:text-primary-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hospital</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_name">Full Name</Label>
                <Input
                  id="admin_name"
                  {...form.register("admin_name")}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                    form.setValue("admin_name", filtered);
                  }}
                  placeholder="Official Representative"
                  required
                />
                {form.formState.errors.admin_name && (
                  <p className="text-red-500 text-[10px] font-bold uppercase">{form.formState.errors.admin_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_email">Email</Label>
                <Input
                  id="admin_email"
                  {...form.register("admin_email")}
                  placeholder="admin@institution.com"
                  type="email"
                  required
                />
                {form.formState.errors.admin_email && (
                  <p className="text-red-500 text-[10px] font-bold uppercase">{form.formState.errors.admin_email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  {...form.register("password")}
                  type="password"
                  placeholder="••••••••"
                  required
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-[10px] font-bold uppercase">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  {...form.register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  required
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-[10px] font-bold uppercase">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_location">Current Location</Label>
              <div className="flex gap-2">
                <Input
                  id="current_location"
                  {...form.register("current_location")}
                  placeholder="City area or GPS coordinates"
                  required
                />
                <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
                  <LocateFixed className="h-4 w-4 mr-2" />
                  Detect
                </Button>
              </div>
              {form.formState.errors.current_location && (
                <p className="text-red-500 text-[10px] font-bold uppercase">{form.formState.errors.current_location.message}</p>
              )}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Required for all admin registrations
              </p>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 py-6 text-lg font-bold" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Continue to Onboarding"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a 
              className="text-primary-600 font-bold hover:underline cursor-pointer"
              onClick={() => navigate('/admin/login')}
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminRegisterPage;