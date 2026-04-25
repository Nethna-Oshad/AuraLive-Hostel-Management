const Maintainer = require('../models/MaintainersModel');

const validSpecializations = ['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'General', 'Other'];

const normalizeSpecialization = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return validSpecializations.includes(value) ? value : 'General';
};

const formatMaintainer = (maintainer) => ({
  _id: maintainer._id,
  name: maintainer.name,
  email: maintainer.email,
  phone: maintainer.phone,
  role: maintainer.role,
  status: maintainer.status,
  category: maintainer.specialization || 'General',
  specialization: maintainer.specialization || 'General',
  availability: maintainer.availability || 'Available',
  experience: maintainer.experience || '1 Year',
  bio: maintainer.bio || 'Maintenance Professional at AuraFix',
  profileImage: maintainer.profileImage || '',
  jobsCompleted: maintainer.jobsCompleted,
  averageRating: maintainer.averageRating,
  createdAt: maintainer.createdAt,
  updatedAt: maintainer.updatedAt,
});

const getMaintainerById = async (req, res) => {
  try {
    const maintainer = await Maintainer.findById(req.params.id);

    if (!maintainer) {
      return res.status(404).json({ message: 'Maintainer not found' });
    }

    res.json(formatMaintainer(maintainer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMaintainerProfile = async (req, res) => {
  try {
    const { name, email, phone, category, specialization, availability, experience, bio } = req.body || {};

    const maintainer = await Maintainer.findById(req.params.id);

    if (!maintainer) {
      return res.status(404).json({ message: 'Maintainer not found' });
    }

    const nextSpecialization = normalizeSpecialization(specialization || category);

    const updatePayload = {};

    if (typeof name === 'string') updatePayload.name = name;
    if (typeof email === 'string') updatePayload.email = email;
    if (typeof phone === 'string') updatePayload.phone = phone;
    if (typeof availability === 'string') updatePayload.availability = availability;
    if (typeof experience === 'string') updatePayload.experience = experience;
    if (typeof bio === 'string') updatePayload.bio = bio;
    if (nextSpecialization) updatePayload.specialization = nextSpecialization;

    if (req.file) {
      updatePayload.profileImage = `/profileImages/${req.file.filename}`;
    }

    const updatedMaintainer = await Maintainer.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedMaintainer) {
      return res.status(404).json({ message: 'Maintainer not found' });
    }

    res.json(formatMaintainer(updatedMaintainer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMaintainerAccount = async (req, res) => {
  try {
    const maintainer = await Maintainer.findByIdAndDelete(req.params.id);

    if (!maintainer) {
      return res.status(404).json({ message: 'Maintainer not found' });
    }

    res.json({ message: 'Maintainer account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMaintainerById,
  updateMaintainerProfile,
  deleteMaintainerAccount,
};