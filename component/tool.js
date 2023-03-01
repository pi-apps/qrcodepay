export async function ImageAsDataURI(path){
    const blob = await fetch(path).then((res) => res.blob());
    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    return reader.readAsDataURL(blob);
  });
}