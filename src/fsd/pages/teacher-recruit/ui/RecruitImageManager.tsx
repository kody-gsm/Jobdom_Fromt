"use client";

import type { ChangeEvent } from "react";
import { MAX_RECRUIT_IMAGES, RECRUIT_IMAGE_ACCEPT, resolveRecruitImageUrl } from "@fsd/entities/recruit";
import type { RecruitImage } from "@fsd/entities/recruit";

export function RecruitImageGallery({ images }: { images: RecruitImage[] }) {
  if (images.length === 0) return null;
  return (
    <ul aria-label="공고 이미지" className="mt-4 grid grid-cols-3 gap-2">
      {images.map((image, index) => (
        <li key={image.id}>
          <a href={resolveRecruitImageUrl(image.url)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-gray-200 bg-white">
            <img src={resolveRecruitImageUrl(image.url)} alt={`공고 이미지 ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function RecruitImageManager({ images, disabled, onAdd, onDelete }: { images: RecruitImage[]; disabled: boolean; onAdd: (event: ChangeEvent<HTMLInputElement>) => void; onDelete: (image: RecruitImage) => void }) {
  const isFull = images.length >= MAX_RECRUIT_IMAGES;
  return (
    <section aria-labelledby="recruit-images-title" className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 id="recruit-images-title" className="text-xs font-bold text-gray-500">공고 이미지</h3>
        <span className="text-xs tabular-nums text-gray-400">{images.length}/{MAX_RECRUIT_IMAGES}장</span>
      </div>
      {images.length === 0 ? <p className="mt-3 text-xs text-gray-400">첨부한 이미지가 없습니다.</p> : (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <li key={image.id} className="relative overflow-hidden rounded-lg border border-gray-200">
              <img src={resolveRecruitImageUrl(image.url)} alt={`공고 이미지 ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
              <button type="button" disabled={disabled} onClick={() => onDelete(image)} aria-label={`공고 이미지 ${index + 1} 삭제`} className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-red-600 shadow-sm disabled:opacity-50">삭제</button>
            </li>
          ))}
        </ul>
      )}
      <label className={`mt-3 inline-flex h-9 items-center rounded-lg border border-[#02C551] bg-white px-3 text-xs font-bold text-[#02a946] ${disabled || isFull ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
        이미지 추가
        <input type="file" multiple accept={RECRUIT_IMAGE_ACCEPT} disabled={disabled || isFull} onChange={onAdd} className="sr-only" />
      </label>
      <p className="mt-2 text-xs leading-5 text-gray-400">여러 장을 한 번에 고를 수 있습니다. 한 장당 10MB, 공고당 최대 {MAX_RECRUIT_IMAGES}장까지 올릴 수 있습니다.</p>
    </section>
  );
}
