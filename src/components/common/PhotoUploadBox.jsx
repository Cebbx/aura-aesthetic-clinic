import React, { useRef, useState } from 'react';
import { Button, Tag, message, Spin, Tooltip } from 'antd';
import {
  CameraOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  CheckCircleFilled,
  ReloadOutlined
} from '@ant-design/icons';
import { compressImageFile } from '../../utils/imageUtils';

const PhotoUploadBox = ({
  value,
  onChange,
  label = 'Treatment Photo',
  presetImages = [],
  aspect = 'video' // 'video' | 'square'
}) => {
  const fileInputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    try {
      setCompressing(true);
      // Auto compress to max 800px width/height and 0.8 JPEG quality
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.8);
      onChange?.(compressedDataUrl);
      message.success('Photo successfully uploaded and optimized!');
    } catch (err) {
      console.error(err);
      message.error('Failed to process image. Please try another photo.');
    } finally {
      setCompressing(false);
      // Reset input value so user can re-upload same file if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange?.('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          {label}
        </label>
        {value && (
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircleFilled /> Ready
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-aura-200 bg-gray-50 shadow-xs">
          {/* Image Preview */}
          <div className={`${aspect === 'square' ? 'h-36 sm:h-44' : 'h-40 sm:h-48'} w-full bg-gray-100 flex items-center justify-center overflow-hidden`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Action overlay / buttons */}
          <div className="p-2.5 bg-white border-t border-aura-100 flex items-center justify-between gap-2">
            <Button
              size="small"
              icon={<CameraOutlined />}
              onClick={() => fileInputRef.current?.click()}
              className="!rounded-xl text-xs !border-aura-300 !text-aura-800 hover:!border-aura-600 font-medium"
            >
              Change Photo
            </Button>

            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              className="!rounded-xl text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-aura-300 hover:border-aura-600 rounded-2xl p-5 text-center bg-aura-50/40 hover:bg-aura-50/80 transition-all duration-200 space-y-2"
        >
          {compressing ? (
            <div className="py-4 space-y-2">
              <Spin />
              <p className="text-xs text-aura-800 font-medium">Processing & optimizing photo...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-aura-200 text-aura-700 flex items-center justify-center text-xl shadow-xs">
                <CameraOutlined />
              </div>

              <div>
                <span className="font-bold text-xs sm:text-sm text-aura-dark block">
                  Tap to Upload Photo from Phone
                </span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Takes photo with camera or choose from gallery / files
                </span>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-aura-200 text-aura-800 text-[10px] font-semibold shadow-xs">
                  <UploadOutlined /> Select Image
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Preset stock choices if available */}
      {presetImages.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] text-gray-400 block mb-1">Or choose a preset photo:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {presetImages.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange?.(preset.url)}
                className={`relative shrink-0 rounded-xl overflow-hidden border transition-all ${
                  value === preset.url
                    ? 'border-aura-700 ring-2 ring-aura-400'
                    : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
                style={{ width: 56, height: 42 }}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadBox;
