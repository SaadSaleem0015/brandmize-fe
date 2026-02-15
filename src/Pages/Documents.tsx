import { UploadDocuments } from "../Components/UploadDocuments";
import {  notyf } from "../Helpers/notyf";

export interface File {
    id: number,
    name: number,
    user_id: number
}

export function Documents() {

    async function afterUpload(response: object) {
        console.log(response);
        
    }

 


    return (
        <>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold sm:mb-6">Documents</h2>

            <UploadDocuments
                onSuccess={afterUpload}
                onStart={() => notyf.success("Uploading...")} />
        </>
    );
}