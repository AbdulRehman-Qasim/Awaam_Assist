import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Calendar, ArrowRight, Wallet, Landmark } from "lucide-react";
import { motion } from "framer-motion";

interface Scheme {
  _id: string;
  schemeName: string;
  category: string;
  department: string;
  province: string;
  benefits?: {
    financial?: {
      amount: number;
      frequency: string;
    }
  };
  official_link?: string;
}

interface SchemesModuleProps {
  data: Scheme[];
}

export const SchemesModule = ({ data }: SchemesModuleProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">No active schemes found</h3>
        <p className="text-slate-500">There are no current government schemes matching your profile in your province.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((scheme, index) => (
        <motion.div
          key={scheme._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full border-none shadow-sm bg-white hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors duration-500" />
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Landmark className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none px-3 py-1 font-semibold">
                  {scheme.category}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                {scheme.schemeName}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Department
                </div>
                <p className="text-sm text-slate-600">{scheme.department}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50/50 transition-colors duration-500">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Benefit</p>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Wallet className="w-4 h-4" />
                    <span>{scheme.benefits?.financial?.amount ? `PKR ${scheme.benefits.financial.amount.toLocaleString()}` : "Support Available"}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Province</p>
                  <p className="text-xs font-bold text-slate-700">{scheme.province}</p>
                </div>
              </div>
              
              <Button className="w-full h-11 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-200" asChild>
                <a href={scheme.official_link || "#"} target="_blank" rel="noopener noreferrer">
                  View Eligibility & Apply <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
