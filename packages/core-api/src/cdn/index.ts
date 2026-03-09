export const upload = async (base: string, file: File, path: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${base}/stores/${path}`, {
        method: "POST",
        body: formData
    });
    const json = await response.json();
    return json.url;
}

export const uploadAvatar = async (base: string, file: File): Promise<string> => {
    return upload(base, file, "avatars");
}
