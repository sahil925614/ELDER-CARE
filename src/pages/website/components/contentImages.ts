
import doctorVisitImage from '@/assets/doctor-visit.jpg'
import homeCareImage from '@/assets/home-care.jpg'
import physiotherapyImage from '@/assets/Physiotherapy.jpg'
import nursingSupportImage from '@/assets/Nursing support.jpg'
import labTestsImage from '@/assets/Lab tests.jpg'
import medicineDeliveryImage from '@/assets/Medicine delivery.jpg'
import aboutFamilyImage from '@/assets/About family.jpg'
import carePlanningImage from '@/assets/Care planning.jpg'
import doctorsImage from '@/assets/Doctors.jpg'
import physiotherapistsImage from '@/assets/Physiotherapists.jpg'
import nursingProfessionalsImage from '@/assets/Nursing professionals.jpg'


export const contentImages: Record<string, { src: string; alt: string }> = {
  'Doctor visits': { src: doctorVisitImage, alt: 'Doctor visit and care support' },
  'Home care': { src: homeCareImage, alt: 'Care and support at home' },
  'Physiotherapy': { src: physiotherapyImage, alt: 'Physiotherapy and mobility support' },
  'Nursing support': { src: nursingSupportImage, alt: 'Nursing care and support' },
  'Lab tests': { src: labTestsImage, alt: 'Laboratory testing services' },
  'Medicine delivery': { src: medicineDeliveryImage, alt: 'Medicine delivery services' },
  
  'About family': { src: aboutFamilyImage, alt: 'Family and elder care' },
 
  'Care planning': { src: carePlanningImage, alt: 'Planning care for a loved one' },

  'Doctors': { src: doctorsImage, alt: 'Medical care professionals' },
  'Physiotherapists': { src: physiotherapistsImage, alt: 'Physiotherapy professionals' },
  'Nursing professionals': { src: nursingProfessionalsImage, alt: 'Nursing professionals' },
}
