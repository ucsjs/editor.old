export const useApi = async (url, options: any = { }) => {
    const config = useRuntimeConfig();
    
    try{
        const res = await $fetch(`${config.api.baseApi}/${url}`, { 
            ...options, 
            initialCache: false,
            server: false,
            lazy: true
        });

        return res;
    }
    catch(e){
        return null;
    }
}