<?php
namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

use Log;

class Upload
{
	public static function uploadImage(?UploadedFile $file, $type='', $name='', $replace=false): array
	{
		$data = ['status' => false, 'message' => '', 'name' => ''];

		if (!$file->isValid()) {
	        return [
	            'status' => false,
	            'message' => $file->getErrorMessage() ?? 'Invalid upload.',
	        ];
	    }

	    $ext = $file->guessExtension();
	    $supportedTypes = ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webp'];

	    if (!in_array(strtolower($ext), $supportedTypes)) {
	        return [
	            'status' => false,
	            'message' => 'Only jpg, jpeg, png, gif, webp, and svg formats are allowed.',
	        ];
	    }

		$convertMethod = match (strtolower($ext)) {
		    'jpg', 'jpeg' => 'toJpeg',
		    'png'         => 'toPng',
		    'webp'        => 'toWebp',
		    default       => 'toJpeg', // fallback
		};

	    $name = $file->hashName(); // or use getClientOriginalName()
	    $path = "images/uploads/{$type}/";
	    $fullPath = $path . $name;

	    // Save original file
	    if ($replace) {
	        // overwrite existing file manually
	        Storage::disk('public')->putFileAs($path, $file, $name);
	    } else {
	        Storage::disk('public')->putFileAs($path, $file, $name);
	    }

	    // Ensure thumb directory exists
	    $thumbPath = "{$path}thumb/";
	    Storage::disk('public')->makeDirectory($thumbPath);

	    // Create thumbnail using Intervention Image
	    $manager = new ImageManager(new GdDriver());
	    $image = $manager->read($file->getRealPath())
				        ->resize(100, 100, function ($constraint) {
				            $constraint->aspectRatio();
				        });

	    // Encode and save thumbnail
        $thumbnailBinary = $image->{$convertMethod}(); // dynamically call toJpeg, toPng, etc.
	    Storage::disk('public')->put("{$thumbPath}{$name}", $thumbnailBinary);

	    return [
	        'status' => true,
	        'name' => $name,
	        'path' => $fullPath,
	        'url' => Storage::url($fullPath),
	        'thumb_url' => Storage::url("{$thumbPath}{$name}"),
	    ];
	}

	public static function uploadFile(?UploadedFile $file, string $type = '', string $name = '', bool $replace = false): array
    {
        $data = ['status' => false, 'message' => '', 'name' => ''];

        if (!$file || !$file->isValid()) {
            $data['message'] = $file?->getErrorMessage() ?? 'Invalid file.';
            return $data;
        }

        // Allow only PDF files
        if ($file->getMimeType() !== 'application/pdf') {
            $data['message'] = 'Only PDF format is allowed.';
            return $data;
        }

        // Generate name if not provided
        $ext = $file->getClientOriginalExtension();
        $name = $name ? "{$name}.{$ext}" : $file->hashName();

        $folder = "uploads/{$type}";
        $filePath = "{$folder}/{$name}";

        // Optionally replace (overwrite) or just save
        if ($replace && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        $storedPath = $file->storeAs($folder, $name, 'public');

        if ($storedPath) {
            $data['status'] = true;
            $data['name'] = $name;
        } else {
            $data['message'] = 'Failed to move uploaded file.';
        }

        return $data;
    }

	public static function deleteFile(string $type = '', string $name = ''): bool
    {
        if (empty($type) || empty($name)) {
            return false;
        }

        $basePath = "uploads/{$type}/{$name}";
        $thumbPath = "uploads/{$type}/thumb/{$name}";

        $disk = Storage::disk('public');

        // Delete main file
        if ($disk->exists($basePath)) {
            $disk->delete($basePath);
        }

        // Delete thumbnail if exists
        if ($disk->exists($thumbPath)) {
            $disk->delete($thumbPath);
        }

        return true;
    }
}
?>