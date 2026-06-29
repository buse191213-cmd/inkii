import { getHeroVideoSrc, getMarketingVideoSrc } from "@/lib/hero-video";
import HeroVideoManager from "./HeroVideoManager";
import MailTestPanel from "./MailTestPanel";
import ShopConfigManager from "./ShopConfigManager";
import CompanyInfoManager from "./CompanyInfoManager";
import { getShopConfig } from "./shop-config-actions";
import { getCompanyInfo } from "@/lib/company-info";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const heroVideo = await getHeroVideoSrc();
  const marketingVideo = await getMarketingVideoSrc();
  const shopConfig = await getShopConfig();
  const companyInfo = await getCompanyInfo();

  return (
    <>
      <p className="crumb">
        Admin <b>/ Einstellungen</b>
      </p>

      <HeroVideoManager currentVideo={heroVideo} kind="hero" />
      <HeroVideoManager currentVideo={marketingVideo} kind="marketing" />

      <CompanyInfoManager initial={{
        name: companyInfo.name,
        owner: companyInfo.owner,
        street: companyInfo.street,
        zip: companyInfo.zip,
        city: companyInfo.city,
        country: companyInfo.country,
        phone: companyInfo.phone,
        email: companyInfo.email,
        web: companyInfo.web,
        ustId: companyInfo.ustId,
        taxNumber: companyInfo.taxNumber,
        bankName: companyInfo.bankName,
        iban: companyInfo.iban,
        bic: companyInfo.bic,
        taxRate: companyInfo.taxRate,
        paymentTermDays: companyInfo.paymentTermDays,
      }} />

      <ShopConfigManager initial={shopConfig} />

      <MailTestPanel defaultEmail="admin@inkii.de" />
    </>
  );
}
