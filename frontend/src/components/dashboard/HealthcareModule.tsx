import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartPulse, MapPin, ExternalLink, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface Hospital {
  _id: string;
  City: string;
  Tehsil: string;
  "Hospital Name": string;
  Cateogry: string;
  website?: string;
  availability?: string;
}

interface HealthcareModuleProps {
  data: Hospital[];
}

export const HealthcareModule = ({ data }: HealthcareModuleProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
        <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">No hospitals found</h3>
        <p className="text-slate-500">We couldn't find hospitals in your specific area matching your preferences.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((hospital, index) => (
        <motion.div
          key={hospital._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full border-slate-100 hover:border-rose-200 hover:shadow-xl transition-all duration-500 group relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
            
            <CardHeader className="pb-2 relative">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-rose-100/50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {hospital.Cateogry}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-6 leading-tight group-hover:text-rose-700 transition-colors">
                {hospital["Hospital Name"]}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 relative">
              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <span>{hospital.Tehsil}, {hospital.City}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className={hospital.availability === 'Available' ? 'text-emerald-600 font-medium' : ''}>
                    {hospital.availability || 'Status Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 flex items-center gap-3">
                <Button size="sm" variant="default" className="flex-1 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100" asChild>
                  <a href={hospital.website || "#"} target="_blank" rel="noopener noreferrer">
                    Details
                  </a>
                </Button>
                {hospital.website && (
                  <Button size="icon" variant="outline" className="border-rose-100 text-rose-600 hover:bg-rose-50" asChild>
                    <a href={hospital.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
