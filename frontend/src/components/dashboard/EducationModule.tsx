import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, GraduationCap, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface University {
  _id: string;
  title: string;
  city: string;
  discipline: string;
  merit: number;
  fee: number;
  logo: string;
  web?: string;
}

interface EducationModuleProps {
  data: University[];
}

export const EducationModule = ({ data }: EducationModuleProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">No matching universities found</h3>
        <p className="text-slate-500">Try updating your profile marks or fee range to see more options.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((uni, index) => (
        <motion.div
          key={uni._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-100 group">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                <img src={uni.logo || "/placeholder-uni.png"} alt={uni.title} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold truncate text-slate-900" title={uni.title}>
                  {uni.title}
                </CardTitle>
                <div className="flex items-center text-slate-500 text-xs mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {uni.city}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                  {uni.discipline}
                </Badge>
                <Badge variant="outline" className="text-slate-600 border-slate-200">
                  Merit: {uni.merit}%
                </Badge>
              </div>
              
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Estimated Fee</p>
                  <p className="text-sm font-bold text-slate-900">PKR {uni.fee?.toLocaleString()}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5" asChild>
                  <a href={uni.web} target="_blank" rel="noopener noreferrer">
                    Details <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
