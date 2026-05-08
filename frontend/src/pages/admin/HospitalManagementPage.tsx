import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { hospitalAdminAPI, HospitalAdminRecord } from '@/services/hospitalAPI';
import { Building2, Edit, MapPin, Tags, Plus, Trash2, Search, Globe, Eye } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

const initialForm: Partial<HospitalAdminRecord> = {
  SerialNum: 0,
  City: '',
  Tehsil: '',
  hospitalName: '',
  category: '',
  website: '',
  treatmentCost: 0,
  availability: 'Available',
  info: '',
};

const HospitalManagementPage = () => {
  const { toast } = useToast();

  const [hospitals, setHospitals] = useState<HospitalAdminRecord[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalAdminRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalAdminRecord | null>(null);
  const [formData, setFormData] = useState<Partial<HospitalAdminRecord>>(initialForm);
  const [saving, setSaving] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const response = await hospitalAdminAPI.getAllHospitals();
      if (response.success) {
        setHospitals(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load hospitals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    const filtered = hospitals.filter(h => 
      h.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHospitals(filtered);
  }, [hospitals, searchQuery]);

  const openAddModal = () => {
    setEditingHospital(null);
    
    // Get admin info for pre-filling
    const adminRaw = localStorage.getItem("admin");
    const admin = adminRaw ? JSON.parse(adminRaw) : null;
    const isHospitalAdmin = admin?.role === 'hospital_admin';

    if (isHospitalAdmin && admin) {
      setFormData({
        ...initialForm,
        hospitalName: admin.entity_name || '',
        City: admin.entity_address?.split(',')[0]?.trim() || '',
        Tehsil: admin.entity_address?.split(',')[1]?.trim() || '',
      });
    } else {
      setFormData(initialForm);
    }
    
    setIsModalOpen(true);
  };

  const openEditModal = (hospital: HospitalAdminRecord) => {
    setEditingHospital(hospital);
    setFormData(hospital);
    setIsModalOpen(true);
  };

    const handleToggleStatus = async (hospital: any) => {
        try {
            const newStatus = hospital.status === 1 ? 0 : 1;
            await hospitalAdminAPI.updateHospital(hospital._id, { status: newStatus });
            
            toast({
                title: "Status Updated",
                description: `${hospital.hospitalName} is now ${newStatus === 1 ? 'Active' : 'Inactive'}`,
            });
            loadHospitals();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (hospital: any) => {
        const isActive = hospital.status === 1 || hospital.status === 'Active' || hospital.status === 'approved';
        return (
            <Badge 
                className={`cursor-pointer transition-colors ${
                    isActive 
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => handleToggleStatus(hospital)}
            >
                {isActive ? "Active" : "Inactive"}
            </Badge>
        );
    };

    const handleDelete = async (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Hospital',
            description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await hospitalAdminAPI.deleteHospital(id);
                    toast({ title: 'Success', description: 'Hospital deleted successfully' });
                    loadHospitals();
                } catch (error) {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete hospital',
                        variant: 'destructive',
                    });
                }
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleSave = async () => {
        if (!formData.City || !formData.Tehsil || !formData.hospitalName || !formData.category) {
            toast({
                title: 'Validation error',
                description: 'Please fill all required fields',
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);
        try {
            if (editingHospital) {
                await hospitalAdminAPI.updateHospital(editingHospital._id, formData);
                toast({ title: 'Success', description: 'Hospital updated successfully' });
            } else {
                await hospitalAdminAPI.createHospital({ ...formData, status: 1 });
                toast({ title: 'Success', description: 'Hospital created successfully' });
            }

            setIsModalOpen(false);
            setFormData(initialForm);
            await loadHospitals();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save hospital',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const adminRaw = localStorage.getItem("admin");
    const admin = adminRaw ? JSON.parse(adminRaw) : null;
    const isHospitalAdmin = admin?.role === 'hospital_admin';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isHospitalAdmin ? "Treatment Management" : "Hospital Management"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isHospitalAdmin 
                          ? `Manage treatments and services for ${admin?.entity_name}` 
                          : "Manage hospital entities and details"}
                    </p>
                </div>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={openAddModal}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {isHospitalAdmin ? "Add Treatment" : "Add Hospital"}
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search hospitals by name, city, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">Loading hospitals...</p>
                    </div>
                ) : filteredHospitals.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {isHospitalAdmin ? "No treatments found." : "No hospitals found."}
                        </p>
                        <Button variant="link" className="text-emerald-600 mt-2" onClick={openAddModal}>
                            {isHospitalAdmin ? "Add your first treatment" : "Add your first hospital"}
                        </Button>
                    </div>
                ) : (
                    filteredHospitals.map((hospital) => (
                        <Card key={hospital._id} className="overflow-hidden border-2 hover:border-emerald-100 transition-colors">
                            <CardContent className="p-0">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                                <Building2 className="h-6 w-6 text-emerald-700" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900">{hospital.hospitalName}</h3>
                                                    {getStatusBadge(hospital)}
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">#{hospital.SerialNum || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Tags className="h-3 w-3" /> {hospital.category}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedHospital(hospital);
                                                    setIsDetailModalOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2 text-emerald-600" />
                                                View
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(hospital)}>
                                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(hospital._id, hospital.hospitalName)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="h-8 w-8 rounded-full bg-cyan-50 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-cyan-700" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">City</p>
                        <p className="text-sm font-semibold text-gray-900">{hospital.City}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-indigo-700" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Tehsil</p>
                        <p className="text-sm font-semibold text-gray-900">{hospital.Tehsil}</p>
                      </div>
                    </div>
                    {hospital.website && (
                      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Website</p>
                          <a href={hospital.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-700 hover:underline truncate max-w-[150px] block">
                            {hospital.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
                {editingHospital 
                    ? (isHospitalAdmin ? 'Edit Treatment' : 'Edit Hospital') 
                    : (isHospitalAdmin ? 'Add New Treatment' : 'Add New Hospital')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                placeholder="e.g. Mayo Hospital"
                value={formData.hospitalName || ''}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Lahore"
                  value={formData.City || ''}
                  onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tehsil">Tehsil</Label>
                <Input
                  id="tehsil"
                  placeholder="e.g. Lahore Cantt"
                  value={formData.Tehsil || ''}
                  onChange={(e) => setFormData({ ...formData, Tehsil: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                placeholder="https://hospital.com"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatmentCost">Treatment Cost (PKR)</Label>
                <Input
                  id="treatmentCost"
                  type="number"
                  placeholder="0"
                  value={formData.treatmentCost || 0}
                  onChange={(e) => setFormData({ ...formData, treatmentCost: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={formData.availability || 'Available'} 
                  onValueChange={(v) => setFormData({ ...formData, availability: v })}
                >
                  <SelectTrigger id="availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="info">Treatment Details / Requirements</Label>
              <Input
                id="info"
                placeholder="e.g. Appointment required, 12h fasting, etc."
                value={formData.info || ''}
                onChange={(e) => setFormData({ ...formData, info: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNum">Serial Number (Optional)</Label>
              <Input
                id="serialNum"
                type="number"
                placeholder="Auto-generated if 0"
                value={formData.SerialNum || 0}
                onChange={(e) => setFormData({ ...formData, SerialNum: Number(e.target.value) })}
              />
            </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
                  {saving 
                    ? 'Saving...' 
                    : editingHospital 
                        ? (isHospitalAdmin ? 'Update Treatment' : 'Update Hospital') 
                        : (isHospitalAdmin ? 'Add Treatment' : 'Create Hospital')}
                </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="danger"
        confirmText="Delete"
      />

      {/* Hospital Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    {selectedHospital && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedHospital.hospitalName}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Current Status</p>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(selectedHospital)}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            handleToggleStatus(selectedHospital);
                                            setSelectedHospital({...selectedHospital, status: selectedHospital.status === 1 ? 0 : 1});
                                        }}
                                        variant="outline"
                                        className={selectedHospital.status === 1 ? "text-red-600 border-red-200 hover:bg-red-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
                                    >
                                        {selectedHospital.status === 1 ? "Deactivate Hospital" : "Activate Hospital"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">City</p>
                                        <p className="font-medium text-gray-900">{selectedHospital.City}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Tehsil</p>
                                        <p className="font-medium text-gray-900">{selectedHospital.Tehsil}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Category</p>
                                        <p className="font-medium text-gray-900">{selectedHospital.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Serial Number</p>
                                        <p className="font-medium text-gray-900">#{selectedHospital.SerialNum || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Treatment Cost</p>
                                        <p className="font-medium text-emerald-600">PKR {selectedHospital.treatmentCost?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Availability</p>
                                        <p className="font-medium text-gray-900">{selectedHospital.availability || 'Available'}</p>
                                    </div>
                                </div>

                                {selectedHospital.info && (
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Treatment Details</p>
                                        <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border">{selectedHospital.info}</p>
                                    </div>
                                )}

                                {selectedHospital.website && (
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Official Website</p>
                                        <a href={selectedHospital.website} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:underline">
                                            {selectedHospital.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
    </div>
  );
};

export default HospitalManagementPage;
