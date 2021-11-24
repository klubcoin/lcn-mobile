export const FilePartMaxSize = 100 * 1024; // 100kbytes

export const PartSize = (totalSize, partLimit) => {
   const size4Limit = Math.ceil(totalSize / Math.max(partLimit, 2));
   return Math.min(size4Limit, FilePartMaxSize);
}

export const FilePart = (partId, data) => ({
   i: partId,
   v: data,
})

export const StoreFile = (from, to, hash, name, createdTimestamp, totalPart, parts) => ({
   action: 'store_file',
   from,
   to,
   hash,
   name,
   created: createdTimestamp,
   totalPart,
   parts
});

export const JoinFile = (from, to, hash, name, totalPart) => ({
   action: 'join_file',
   from,
   to,
   hash,
   name,
   totalPart,
});

export const SavedFile = (hash, name, createdTimestamp, parts) => ({
   hash,
   name,
   created: createdTimestamp,
   parts: parts.map(e => ({ i: e.i })),
   nb_files: 1,
   // used_size_bytes: usedSize,
   // available_size_bytes: availableSize,
   // total_size_bytes: totalSize
});

export const ContainFiles = (from, savedFiled) => ({
   action: 'contain_files',
   from,
   files: [savedFiled]
});

export const ReadFile = (from, hash, name) => (
   {
      action: 'read_file',
      from,
      hash,
      name,
   }
);

export const ReadFileResult = (from, hash, name, createdTimestamp, totalPart, parts) => (
   {
      action: 'read_file',
      from,
      hash,
      name,
      created: createdTimestamp,
      totalPart,
      parts,
   }
);