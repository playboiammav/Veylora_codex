import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  const logos = {
    // Hardware platforms ONLY - All white transparent background assets
    // Note: PC is hardware text "PC" and does NOT use Steam or a generic icon
    platforms: {
      "ps5": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/PlayStation_5_logo.svg/512px-PlayStation_5_logo.svg.png",
      "ps4": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PlayStation_4_logo_and_wordmark.svg/512px-PlayStation_4_logo_and_wordmark.svg.png",
      "ps_vita": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/PlayStation_Vita_logo.svg/512px-PlayStation_Vita_logo.svg.png",
      "psp": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/PSP_Logo.svg/512px-PSP_Logo.svg.png",
      "xbox_series": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Xbox_Logo.svg/512px-Xbox_Logo.svg.png",
      "xbox_one": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Xbox_Logo.svg/512px-Xbox_Logo.svg.png",
      "xbox_360": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Xbox_Logo.svg/512px-Xbox_Logo.svg.png",
      "xbox": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Xbox_Logo.svg/512px-Xbox_Logo.svg.png",
      "nintendo_switch": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Nintendo_Switch_Logo.svg/512px-Nintendo_Switch_Logo.svg.png",
      "nintendo_switch_2": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Nintendo_Switch_Logo.svg/512px-Nintendo_Switch_Logo.svg.png",
      "nintendo_3ds": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Nintendo_3ds_logo.svg/512px-Nintendo_3ds_logo.svg.png",
      "wii": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Wii.svg/512px-Wii.svg.png",
      "wii_u": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Wii_U_logo.svg/512px-Wii_U_logo.svg.png",
      "steam_deck": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png",
      "windows": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Windows_logo_-_2012_%28dark_blue%29.svg/512px-Windows_logo_-_2012_%28dark_blue%29.svg.png",
      "mac": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/512px-Apple_logo_white.svg.png",
      "linux": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/512px-Tux.svg.png",
      "android": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/512px-Android_robot.svg.png",
      "ios": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Apple_logo_white.svg/512px-Apple_logo_white.svg.png",
      "meta_quest": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_inc._logo.svg/512px-Meta_Platforms_inc._logo.svg.png",
      "nvidia": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/512px-Nvidia_logo.svg.png",
      "rog_ally": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Asus_Republic_of_Gamers_logo.svg/512px-Asus_Republic_of_Gamers_logo.svg.png"
    },
    // Purchase & Official Stores ONLY
    stores: {
      "playstation_store": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/512px-PlayStation_logo.svg.png",
      "xbox_store": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Xbox_Logo.svg/512px-Xbox_Logo.svg.png",
      "steam": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png",
      "epic_games": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Epic_Games_logo.svg/512px-Epic_Games_logo.svg.png",
      "gog": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/GOG.com_logo.svg/512px-GOG.com_logo.svg.png",
      "ea_app": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Electronic-Arts-Logo.svg/512px-Electronic-Arts-Logo.svg.png",
      "ubisoft_connect": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Ubisoft_logo.svg/512px-Ubisoft_logo.svg.png",
      "battlenet": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Battle.net_2017_logo.svg/512px-Battle.net_2017_logo.svg.png",
      "nintendo_eshop": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Nintendo_eShop_icon.svg/512px-Nintendo_eShop_icon.svg.png",
      "microsoft_store": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Store_2022_logo.svg/512px-Microsoft_Store_2022_logo.svg.png"
    },
    // Subscriptions
    subscriptions: {
      "game_pass": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Xbox_Game_Pass_logo.svg/512px-Xbox_Game_Pass_logo.svg.png",
      "ps_plus": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/PlayStation_Plus_logo.svg/512px-PlayStation_Plus_logo.svg.png",
      "ea_play": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Electronic-Arts-Logo.svg/512px-Electronic-Arts-Logo.svg.png"
    }
  };

  return NextResponse.json(
    { status: 'success', data: logos },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    }
  );
}
