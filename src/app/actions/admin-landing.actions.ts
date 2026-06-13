'use server';

import { prisma } from '@/lib/prisma';
import { checkAdmin } from './admin-course.actions';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

// Helper to check if file is valid upload
function isValidFile(file: any): file is File {
  return file && typeof file === 'object' && 'size' in file && file.size > 0;
}

export async function saveLandingSettingsAction(prevState: any, formData: FormData) {
  try {
    await checkAdmin();

    // 1. Save Text & JSON configs
    const textFields = ['landing_hero_heading', 'landing_hero_subtext'];
    const jsonFields = ['landing_features', 'landing_faqs', 'landing_reviews'];

    const updates = [];

    for (const key of textFields) {
      const value = formData.get(key) as string;
      if (value !== null) {
        updates.push(
          prisma.settings.upsert({
            where: { key },
            update: { value, updated_at: new Date() },
            create: { key, value, created_at: new Date(), updated_at: new Date() }
          })
        );
      }
    }

    for (const key of jsonFields) {
      const value = formData.get(key) as string;
      if (value !== null) {
        updates.push(
          prisma.settings.upsert({
            where: { key },
            update: { value, updated_at: new Date() },
            create: { key, value, created_at: new Date(), updated_at: new Date() }
          })
        );
      }
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'landing');
    await mkdir(uploadDir, { recursive: true });

    // 2. Handle Hero Image
    const heroFile = formData.get('landing_hero_image');
    if (isValidFile(heroFile)) {
      const ext = heroFile.name.split('.').pop() || 'webp';
      const fileName = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
      const filePath = join(uploadDir, fileName);

      const arrayBuffer = await heroFile.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));
      
      const relativePath = `uploads/landing/${fileName}`;
      updates.push(
        prisma.settings.upsert({
          where: { key: 'landing_hero_image' },
          update: { value: relativePath, updated_at: new Date() },
          create: { key: 'landing_hero_image', value: relativePath, created_at: new Date(), updated_at: new Date() }
        })
      );
    }

    // 3. Handle Comparison Image
    const compFile = formData.get('landing_comparison_image');
    if (isValidFile(compFile)) {
      const ext = compFile.name.split('.').pop() || 'webp';
      const fileName = `comparison_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
      const filePath = join(uploadDir, fileName);

      const arrayBuffer = await compFile.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));
      
      const relativePath = `uploads/landing/${fileName}`;
      updates.push(
        prisma.settings.upsert({
          where: { key: 'landing_comparison_image' },
          update: { value: relativePath, updated_at: new Date() },
          create: { key: 'landing_comparison_image', value: relativePath, created_at: new Date(), updated_at: new Date() }
        })
      );
    }

    // 4. Handle Slider Images Deletions & Additions
    const dbImagesSetting = await prisma.settings.findUnique({
      where: { key: 'landing_slider_images' }
    });
    let currentImages: string[] = [];
    if (dbImagesSetting?.value) {
      try {
        currentImages = JSON.parse(dbImagesSetting.value);
      } catch (e) {
        currentImages = [];
      }
    }

    // Process deletions
    const deleteImages = formData.getAll('delete_images[]') as string[];
    for (const imgPath of deleteImages) {
      const idx = currentImages.indexOf(imgPath);
      if (idx !== -1) {
        currentImages.splice(idx, 1);
        try {
          const fullPath = join(process.cwd(), 'public', imgPath);
          await unlink(fullPath);
        } catch (err) {
          console.warn(`Could not delete file: ${imgPath}`);
        }
      }
    }

    // Process additions
    const newFiles = formData.getAll('slider_images[]');
    for (const f of newFiles) {
      if (isValidFile(f)) {
        const ext = f.name.split('.').pop() || 'webp';
        const fileName = `landing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
        const filePath = join(uploadDir, fileName);

        const arrayBuffer = await f.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));
        
        currentImages.push(`uploads/landing/${fileName}`);
      }
    }

    // Save slider list back to database
    updates.push(
      prisma.settings.upsert({
        where: { key: 'landing_slider_images' },
        update: { value: JSON.stringify(currentImages), updated_at: new Date() },
        create: { key: 'landing_slider_images', value: JSON.stringify(currentImages), created_at: new Date(), updated_at: new Date() }
      })
    );

    // Run all database operations in a transaction
    await prisma.$transaction(updates);

    revalidatePath('/admin/settings/landing');
    return { success: true, message: 'Landing page settings saved successfully.' };
  } catch (error: any) {
    console.error('Error saving landing page settings:', error);
    return { error: error.message || 'Failed to save landing settings.' };
  }
}
